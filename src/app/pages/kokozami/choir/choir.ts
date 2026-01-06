import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PerformanceService } from '../../../services/performance.service';
import { RoleService } from '../../../services/role.service';
import { AudioService } from '../../../services/audio.service';
import { ParticipationService } from '../../../services/participation.service';
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
  audioEnabled = false;

  constructor(
    private perf: PerformanceService,
    public role: RoleService,
    private audio: AudioService,
    private viz: VisualizationService,
    private participation: ParticipationService
  ) {}

  ngOnInit(): void {
    this.subs.push(this.perf.performance$.subscribe((p) => this.onPerformance(p)));
    try { this.audioEnabled = !!localStorage.getItem('choir:audioEnabled'); } catch (e) { this.audioEnabled = false; }
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
      // Let participation service attempt join immediately for late-arriving clients
      if (!this.isLeader) {
        try { this.participation.joinForPerformance(p); } catch (e) { /* ignore */ }
      }
      if (!this.preloaded) {
        const url = encodeURI('/assets/audio/gold rush.mp3');
        this.audio.preload([url]).catch(() => {
          // ignore preload errors for now
        });
        this.preloaded = true;
      }
    }

    // On PLAYING: schedule audio and start viz
    if (p.status === 'PLAYING') {
      if (p.startTime) this.audio.schedule(p.startTime);
      setTimeout(() => {
        if (this.canvasRef) this.viz.start(this.canvasRef.nativeElement);
      }, 0);
    } else {
      this.viz.stop();
      if (p.status === 'IDLE') {
        this.preloaded = false;
      }
    }
  }

  get isLeader() {
    return this.role.isLeader(this.performance?.leaderId ?? null);
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
    try { localStorage.setItem('choir:audioEnabled', '1'); } catch (e) { /* ignore */ }
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
  }
}
