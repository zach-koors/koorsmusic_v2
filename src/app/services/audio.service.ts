import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private buffers: AudioBuffer[] = [];
  private sources: AudioBufferSourceNode[] = [];
  private endedSubject = new Subject<void>();
  public readonly ended$ = this.endedSubject.asObservable();
  private startedSubject = new Subject<void>();
  public readonly started$ = this.startedSubject.asObservable();
  private startTimeout: any = null;
  private lastScheduledStartTimeMs: number | null = null;

  async ensureContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      const Ctor: any = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new Ctor();
      // create analyser if possible
      const createAnalyser = (this.audioContext as any).createAnalyser;
      if (typeof createAnalyser === 'function') {
        const a = createAnalyser.call(this.audioContext) as AnalyserNode;
        this.analyser = a;
        this.analyser.fftSize = 2048;
      }
    }
    // non-null assertion: ensureContext always initializes audioContext
    return this.audioContext!;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  async preload(urls: string[]) {
    const ctx = await this.ensureContext();
    const fetched = await Promise.all(urls.map(u => fetch(u).then(r => r.arrayBuffer())));
    const decoded = await Promise.all(fetched.map(b => ctx.decodeAudioData(b.slice(0))));
    this.buffers = decoded;
  }

  async schedule(startTimeMs: number): Promise<void> {
    // If we're already scheduled for this start time and sources exist, do nothing
    if (this.lastScheduledStartTimeMs === startTimeMs && this.sources.length > 0) return;

    // Ensure audio context exists (may initialize analyser)
    if (!this.audioContext) {
      try { await this.ensureContext(); } catch (e) { return; }
    }

    // stop any previous sources (we'll schedule fresh ones)
    this.stop();

    const now = Date.now();
    // Apply a small safety buffer to compensate for client-server clock skew / latency
    const SAFETY_BUFFER_MS = 200;
    const offsetMs = Math.max(0, startTimeMs - now - SAFETY_BUFFER_MS);
    const offsetSec = offsetMs / 1000;
    const playTime = this.audioContext!.currentTime + offsetSec;

    let remaining = 0;
    let endedEmitted = false;

    for (const buf of this.buffers) {
      const src = this.audioContext!.createBufferSource();
      src.buffer = buf;
      const gain = this.audioContext!.createGain();
      src.connect(gain);
      if (this.analyser) gain.connect(this.analyser);
      gain.connect(this.audioContext!.destination);
      remaining++;
      src.onended = () => {
        try {
          remaining--;
          if (remaining <= 0 && !endedEmitted) {
            endedEmitted = true;
            this.endedSubject.next();
          }
        } catch (e) { /* ignore */ }
      };
      try { src.start(playTime); } catch (e) { /* ignore */ }
      this.sources.push(src);
    }

    // Emit a "started" signal at the time audio actually begins playing locally.
    // Use AudioContext time converted to ms and a timer; clear any previous timer.
    try {
      if (this.startTimeout) {
        clearTimeout(this.startTimeout);
        this.startTimeout = null;
      }
      const nowAudioTime = this.audioContext!.currentTime;
      const msUntilStart = Math.max(0, Math.round((playTime - nowAudioTime) * 1000));
      if (msUntilStart <= 20) {
        // start essentially now
        this.startedSubject.next();
      } else {
        this.startTimeout = setTimeout(() => {
          try { this.startedSubject.next(); } finally { this.startTimeout = null; }
        }, msUntilStart);
      }
    } catch (e) {
      // ignore timer/scheduling errors
    }

    this.lastScheduledStartTimeMs = startTimeMs;
    
  }

  stop() {
    for (const s of this.sources) {
      try { s.stop(); } catch { /* ignore */ }
      try { s.disconnect(); } catch { /* ignore */ }
    }
    this.sources = [];
    this.lastScheduledStartTimeMs = null;
    if (this.startTimeout) {
      try { clearTimeout(this.startTimeout); } catch (e) { /* ignore */ }
      this.startTimeout = null;
    }
  }
}
