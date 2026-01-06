import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private buffers: AudioBuffer[] = [];
  private sources: AudioBufferSourceNode[] = [];

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

  schedule(startTimeMs: number) {
    if (!this.audioContext) return;
    // stop any previous sources
    this.stop();

    const now = Date.now();
    // Apply a small safety buffer to compensate for client-server clock skew / latency
    const SAFETY_BUFFER_MS = 200;
  const offsetMs = Math.max(0, startTimeMs - now - SAFETY_BUFFER_MS);
  // log scheduling info for debugging clock skew / latency
  try { console.debug('Audio.schedule', { startTimeMs, now, SAFETY_BUFFER_MS, offsetMs }); } catch (e) { /* no-op */ }
    const offsetSec = offsetMs / 1000;
    const playTime = this.audioContext.currentTime + offsetSec;

    for (const buf of this.buffers) {
      const src = this.audioContext.createBufferSource();
      src.buffer = buf;
      const gain = this.audioContext.createGain();
      src.connect(gain);
      if (this.analyser) gain.connect(this.analyser);
      gain.connect(this.audioContext.destination);
      src.start(playTime);
      this.sources.push(src);
    }
  }

  stop() {
    for (const s of this.sources) {
      try { s.stop(); } catch { /* ignore */ }
      try { s.disconnect(); } catch { /* ignore */ }
    }
    this.sources = [];
  }
}
