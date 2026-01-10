import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PerformanceService } from '../../../services/performance.service';
import { RoleService } from '../../../services/role.service';
import { AudioService } from '../../../services/audio.service';
import { ParticipationService } from '../../../services/participation.service';
import { VoicePart, VOICE_PART_LABEL, VOICE_PART_NAME } from '../../../models/voice-part';
import { VisualizationService } from '../../../services/visualization.service';

@Component({
  selector: 'app-choir',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './choir.html',
  styleUrl: './choir.scss'
})
export class Choir implements OnInit, OnDestroy {
  @ViewChild('vizCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  performance: any = null;
  subs: Subscription[] = [];
  claiming = false;
  buttonsDisabled = false;
  private preloaded = false;
  private preloadedPart: VoicePart | null = null;
  currentAssignedPart: VoicePart | null = null;
  readonly VOICE_PART_LABEL = VOICE_PART_LABEL;
  audioEnabled = false;
  localFinished = false;
  private audioEndSub: Subscription | null = null;
  private finishTimeout: any = null;
  private readonly THANK_YOU_MS = 60_000; // show THANK YOU for 60s before resuming polling
  private audioStartSub: Subscription | null = null;

  constructor(
    private perf: PerformanceService,
    public role: RoleService,
    private audio: AudioService,
    private viz: VisualizationService,
    private participation: ParticipationService
  ) {}

  ngOnInit(): void {
    this.subs.push(this.perf.performance$.subscribe((p) => this.onPerformance(p)));
    // Always initialize audioEnabled to false to force user gesture every visit
    this.audioEnabled = false;
    // Subscribe to assigned voice part and preload the appropriate audio
    try {
      this.subs.push(this.participation.assignedVoicePart$.subscribe((part: VoicePart) => {
        try { this.currentAssignedPart = part; } catch (e) {}
        try {
          if (!part) return;
          // Preload only when we haven't already for this part
          if (this.preloadedPart === part) return;
          const url = encodeURI(`/assets/audio/${part}.mp3`);
          this.audio.preload([url]).catch(() => { /* ignore preload errors */ });
          this.preloadedPart = part;
          this.preloaded = true;
        } catch (e) { /* ignore */ }
      }));
    } catch (e) {}
  }

  private onPerformance(p: any) {
    this.performance = p;

    if (!p) return;

    // If IDLE attempt to claim once
    // Only attempt to claim after we've synced with the server once — avoid acting on the
    // local placeholder performance that exists before the first network fetch.
    if (p.status === 'IDLE' && this.perf.hasSynced && !this.claiming && !this.role.leaderId) {
      this.claiming = true;
      this.perf.claim().subscribe((resp) => {
        if (resp && resp.leaderId) {
          this.role.setLeaderId(resp.leaderId);
        }
        this.claiming = false;
      }, () => {
        this.claiming = false;
      });
      return;
    }

    // On READY: preload audio
    if (p.status === 'READY') {
      // Let participation service attempt join immediately for late-arriving clients (leaders included)
      try { this.participation.joinForPerformance(p); } catch (e) { /* ignore */ }
      // Preloading handled by assignedVoicePart$ subscription
    }

    // On PLAYING: schedule audio and start viz
    if (p.status === 'PLAYING') {
      // stop polling while we play locally
      try { this.perf.stopPolling(); } catch (e) {}
      this.localFinished = false;
      // Ensure we start visualization as soon as local audio actually starts.
      try { this.audioStartSub?.unsubscribe(); } catch (e) {}
      this.audioStartSub = this.audio.started$.subscribe(() => {
        try { if (this.canvasRef) this.viz.start(this.canvasRef.nativeElement); } catch (e) {}
      });
      if (p.startTime) {
        const sched = this.audio.schedule(p.startTime);
        // schedule may return a promise; if so, start viz after it resolves.
        if (sched && typeof (sched as any).then === 'function') {
          (sched as any).then(() => {
            try { if (this.canvasRef) this.viz.start(this.canvasRef.nativeElement); } catch (e) {}
          }).catch(() => {
            // fallback immediate start
            try { if (this.canvasRef) this.viz.start(this.canvasRef.nativeElement); } catch (e) {}
          });
        } else {
          setTimeout(() => {
            if (this.canvasRef) this.viz.start(this.canvasRef.nativeElement);
          }, 0);
        }
      } else {
        setTimeout(() => {
          if (this.canvasRef) this.viz.start(this.canvasRef.nativeElement);
        }, 0);
      }

      // subscribe to audio ended to show thank-you and resume polling
      try {
        this.audioEndSub?.unsubscribe();
      } catch (e) {}
      this.audioEndSub = this.audio.ended$.subscribe(() => {
        // stop viz and show local finished UI
        try { this.viz.stop(); } catch (e) {}
        this.localFinished = true;
        // Delay refreshing/resuming polling so the THANK YOU message remains visible
        // for a short period rather than immediately when playback ends.
        try { if (this.finishTimeout) { clearTimeout(this.finishTimeout); this.finishTimeout = null; } } catch (e) {}
        this.finishTimeout = setTimeout(() => {
          try { this.perf.refresh(true); } catch (e) {}
          try { this.perf.resumePolling(); } catch (e) {}
          this.finishTimeout = null;
          // allow the server state to control the UI after refresh
          this.localFinished = false;
        }, this.THANK_YOU_MS);
      });
    } else {
      // not playing anymore; ensure any audio end subscription is cleared
      try { this.audioEndSub?.unsubscribe(); } catch (e) {}
      this.audioEndSub = null;
      try { this.audioStartSub?.unsubscribe(); } catch (e) {}
      this.audioStartSub = null;
      // clear any pending finish timeout when playback stops or changes
      try { if (this.finishTimeout) { clearTimeout(this.finishTimeout); this.finishTimeout = null; } } catch (e) {}
      this.viz.stop();
      if (p.status === 'IDLE') {
        this.preloaded = false;
        this.preloadedPart = null;
      }
    }
  }

  get isLeader() {
    return this.role.isLeader(this.performance?.leaderId ?? null);
  }

  get headerText() {
    if (this.localFinished) return 'THANK YOU';
    const status = this.performance?.status || 'IDLE';
    // Keep headerText generic; PLAYING label is shown in template with part on next line
    return status;
  }

  get assignedPartName() {
    const part: VoicePart = this.currentAssignedPart || 'S';
    return VOICE_PART_NAME[part] || VOICE_PART_NAME['S'];
  }

  async onStart() {
    if (!this.isLeader) return;
    this.buttonsDisabled = true;
    try {
      const ctx = await this.audio.ensureContext();
      // resume if suspended (user gesture required on some browsers)
      // @ts-ignore - may not exist in some environments
      if (typeof (ctx as any).state === 'string' && (ctx as any).state === 'suspended') {
        await (ctx as any).resume();
      }
    } catch (e) {
      // ignore audio context resume failures
    }

    this.perf.start(this.role.leaderId || '').subscribe(() => {
      this.buttonsDisabled = false;
    }, () => { this.buttonsDisabled = false; });
  }

  async enableAudio() {
    try {
      const ctx = await this.audio.ensureContext();
      if ((ctx as any).state === 'suspended' && typeof (ctx as any).resume === 'function') {
        try { await (ctx as any).resume(); } catch (e) { /* ignore */ }
      }
    } catch (e) {
      // ignore
    }

    this.audioEnabled = true;
    // Do not persist audioEnabled to force prompt on every visit
    // try { localStorage.setItem('choir:audioEnabled', '1'); } catch (e) { /* ignore */ }
  }

  onReset() {
    if (!this.isLeader && !(this.performance && Date.now() > this.performance.expiresAt)) return;
    this.buttonsDisabled = true;
    this.perf.reset(this.role.leaderId || undefined).subscribe(() => {
      this.role.setLeaderId(null);
      this.buttonsDisabled = false;
    }, () => { this.buttonsDisabled = false; });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    try { if (this.finishTimeout) { clearTimeout(this.finishTimeout); this.finishTimeout = null; } } catch (e) {}
  }
}
