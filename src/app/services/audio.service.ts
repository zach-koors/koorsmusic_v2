import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioElements: HTMLAudioElement[] = [];
  private mediaElementSources: MediaElementAudioSourceNode[] = [];
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
    // Clean up any existing audio elements
    this.cleanupAudioElements();
    
    // Create HTML5 audio elements for playback
    // This approach works on iOS even in silent mode
    this.audioElements = urls.map(url => {
      const audio = new Audio();
      audio.src = url;
      audio.preload = 'auto';
      // playsInline is critical for iOS to respect playback
      audio.setAttribute('playsinline', '');
      audio.setAttribute('webkit-playsinline', '');
      return audio;
    });

    // Ensure audio context for visualization
    await this.ensureContext();
  }

  private cleanupAudioElements() {
    // Clean up existing audio elements
    for (const el of this.audioElements) {
      try {
        el.pause();
        el.src = '';
        el.load();
      } catch (e) { /* ignore */ }
    }
    this.audioElements = [];
    
    // Clean up media element sources
    for (const src of this.mediaElementSources) {
      try { src.disconnect(); } catch (e) { /* ignore */ }
    }
    this.mediaElementSources = [];
  }

  async schedule(startTimeMs: number): Promise<void> {
    // If we're already scheduled for this start time and audio elements exist, do nothing
    if (this.lastScheduledStartTimeMs === startTimeMs && this.audioElements.length > 0) return;

    // Ensure audio context exists (may initialize analyser)
    if (!this.audioContext) {
      try { await this.ensureContext(); } catch (e) { return; }
    }

    // stop any previous playback
    this.stop();

    const now = Date.now();
    // Apply a small safety buffer to compensate for client-server clock skew / latency
    const SAFETY_BUFFER_MS = 200;
    const delayMs = Math.max(0, startTimeMs - now - SAFETY_BUFFER_MS);

    let remaining = this.audioElements.length;
    let endedEmitted = false;

    // Setup ended callbacks and connect to analyser if available
    for (const audio of this.audioElements) {
      // Connect to analyser for visualization if audio context and analyser exist
      if (this.audioContext && this.analyser) {
        try {
          const source = this.audioContext.createMediaElementSource(audio);
          source.connect(this.analyser);
          this.analyser.connect(this.audioContext.destination);
          this.mediaElementSources.push(source);
        } catch (e) {
          // If createMediaElementSource fails (e.g., already connected), 
          // just connect audio directly to speakers
          // This is expected behavior after first connection
        }
      }

      audio.onended = () => {
        try {
          remaining--;
          if (remaining <= 0 && !endedEmitted) {
            endedEmitted = true;
            this.endedSubject.next();
          }
        } catch (e) { /* ignore */ }
      };
    }

    // Schedule playback
    if (delayMs <= 20) {
      // Start immediately
      for (const audio of this.audioElements) {
        try { 
          audio.currentTime = 0;
          audio.play().catch(() => { /* ignore play promise rejection */ });
        } catch (e) { /* ignore */ }
      }
      this.startedSubject.next();
    } else {
      // Start after delay
      setTimeout(() => {
        for (const audio of this.audioElements) {
          try {
            audio.currentTime = 0;
            audio.play().catch(() => { /* ignore play promise rejection */ });
          } catch (e) { /* ignore */ }
        }
        this.startedSubject.next();
      }, delayMs);
    }

    // Clear any previous start timeout
    if (this.startTimeout) {
      clearTimeout(this.startTimeout);
      this.startTimeout = null;
    }

    this.lastScheduledStartTimeMs = startTimeMs;
  }

  stop() {
    for (const audio of this.audioElements) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch { /* ignore */ }
    }
    this.lastScheduledStartTimeMs = null;
    if (this.startTimeout) {
      try { clearTimeout(this.startTimeout); } catch (e) { /* ignore */ }
      this.startTimeout = null;
    }
  }
}
