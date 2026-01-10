import { Injectable, OnDestroy } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';
import { PerformanceService } from './performance.service';
import { Performance } from '../models/performance';
import { VoicePart, isValidVoicePart } from '../models/voice-part';

@Injectable({ providedIn: 'root' })
export class ParticipationService implements OnDestroy {
  private sub: Subscription;
  // Raw value returned by server (may be null)
  private serverVoicePartSub = new BehaviorSubject<VoicePart | null>(null);
  // Effective assigned voice part (never null; falls back to 'S')
  private assignedVoicePartSub = new BehaviorSubject<VoicePart>('S');
  private lastJoinedVersion: number | null = null;
  private pendingJoinVersions = new Set<number>();
  private hasJoinedCurrent = false;

  constructor(private perf: PerformanceService) {
    this.sub = this.perf.performance$.subscribe((p: Performance) => {
      if (p.status === 'READY' && p.version !== this.lastJoinedVersion) {
        this.joinForPerformance(p);
      }
      if (p.status !== 'READY') {
        this.lastJoinedVersion = null;
        this.hasJoinedCurrent = false;
        // Only reset voice part state when performance has fully returned to IDLE
        // (we want to retain the assigned part during PLAYING so clients play the
        // audio they were assigned)
        if (p.status === 'IDLE') {
          try { this.serverVoicePartSub.next(null); } catch (e) {}
          try { this.assignedVoicePartSub.next('S'); } catch (e) {}
        }
      }
    });
  }

  // Public observables for troubleshooting and component use
  get serverVoicePart$() { return this.serverVoicePartSub.asObservable(); }
  get assignedVoicePart$() { return this.assignedVoicePartSub.asObservable(); }

  // Public helper so callers (e.g., the Choir component) can trigger join logic
  // for the provided performance object. This is idempotent via lastJoinedVersion.
  joinForPerformance(p: Performance) {
  if (p.status !== 'READY') return;
  // If we've already joined this performance in this session, don't join again
  if (this.hasJoinedCurrent) return;
    const capturedVersion = p.version;
    // If we've already joined this version or a join is pending, do nothing
    if (this.lastJoinedVersion === capturedVersion || this.pendingJoinVersions.has(capturedVersion)) return;

    // Mark as pending and optimistically set lastJoinedVersion to prevent duplicate requests
    this.pendingJoinVersions.add(capturedVersion);
    this.lastJoinedVersion = capturedVersion;

    this.perf.join().subscribe((resp: Performance | any) => {
      // Log raw key returned from backend for troubleshooting
      try { console.log('performance/join returned voicePart:', resp?.voicePart); } catch (e) {}

      // Interpret server-provided voicePart; treat invalid strings as null
      const serverPart: VoicePart | null = (resp && typeof resp.voicePart === 'string' && isValidVoicePart(resp.voicePart)) ? resp.voicePart : (resp && resp.voicePart === null ? null : (resp && typeof resp.voicePart === 'string' ? null : null));
      try { this.serverVoicePartSub.next(serverPart); } catch (e) {}

      // Fallback to 'S' if server returned null or we encountered an error
      if (serverPart === null) {
        try { console.warn('performance/join returned null or invalid voicePart; falling back to S'); } catch (e) {}
        try { this.assignedVoicePartSub.next('S'); } catch (e) {}
        try { console.log('assignedVoicePart (effective):', 'S'); } catch (e) {}
      } else {
        try { this.assignedVoicePartSub.next(serverPart); } catch (e) {}
        try { console.log('assignedVoicePart (effective):', serverPart); } catch (e) {}
      }
      // Use returned version if provided, otherwise keep capturedVersion
      if (resp && typeof resp.version === 'number') {
        this.lastJoinedVersion = resp.version;
      } else {
        this.lastJoinedVersion = capturedVersion;
      }
      // Mark that we've successfully joined this performance; prevents re-joining
      this.hasJoinedCurrent = true;
      this.pendingJoinVersions.delete(capturedVersion);
      try { this.perf.refresh(true); } catch (e) { /* ignore */ }
    }, (err: any) => {
      // On client-visible conflicts, mark as joined for this version to avoid retry storms
      if (err && err.status && (err.status === 409 || err.status === 403)) {
        this.lastJoinedVersion = capturedVersion;
        this.pendingJoinVersions.delete(capturedVersion);
        // On error, log and fallback to S
        try { console.warn('performance/join encountered error; falling back to S', err); } catch (e) {}
        try { this.serverVoicePartSub.next(null); } catch (e) {}
        try { this.assignedVoicePartSub.next('S'); } catch (e) {}
      } else {
        // On transient/network errors, allow retry by clearing pending and lastJoinedVersion
        this.pendingJoinVersions.delete(capturedVersion);
        if (this.lastJoinedVersion === capturedVersion) this.lastJoinedVersion = null;
        try { console.warn('performance/join encountered error; falling back to S', err); } catch (e) {}
        try { this.serverVoicePartSub.next(null); } catch (e) {}
        try { this.assignedVoicePartSub.next('S'); } catch (e) {}
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
