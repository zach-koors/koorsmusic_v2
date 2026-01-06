import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PerformanceService } from './performance.service';
import { Performance } from '../models/performance';

@Injectable({ providedIn: 'root' })
export class ParticipationService implements OnDestroy {
  private sub: Subscription;
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
      }
    });
  }

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
      } else {
        // On transient/network errors, allow retry by clearing pending and lastJoinedVersion
        this.pendingJoinVersions.delete(capturedVersion);
        if (this.lastJoinedVersion === capturedVersion) this.lastJoinedVersion = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
