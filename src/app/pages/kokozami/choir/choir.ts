import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PerformanceService } from '../../../services/performance.service';
import { RoleService } from '../../../services/role.service';
import { AudioService } from '../../../services/audio.service';
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

  constructor(
    private perf: PerformanceService,
    public role: RoleService,
    private audio: AudioService,
    private viz: VisualizationService
  ) {}

  ngOnInit(): void {
    this.subs.push(this.perf.performance$.subscribe((p) => this.onPerformance(p)));
  }

  private onPerformance(p: any) {
    this.performance = p;

    if (!p) return;

    // If IDLE attempt to claim once
    if (p.status === 'IDLE' && !this.claiming && !this.role.leaderId) {
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
      this.audio.preload([]);
    }

    // On PLAYING: schedule audio and start viz
    if (p.status === 'PLAYING') {
      if (p.startTime) this.audio.schedule(p.startTime);
      setTimeout(() => {
        if (this.canvasRef) this.viz.start(this.canvasRef.nativeElement);
      }, 0);
    } else {
      this.viz.stop();
    }
  }

  get isLeader() {
    return this.role.isLeader(this.performance?.leaderId ?? null);
  }

  onStart() {
    if (!this.isLeader) return;
    this.buttonsDisabled = true;
    this.perf.start(this.role.leaderId || '').subscribe(() => {
      this.buttonsDisabled = false;
    }, () => { this.buttonsDisabled = false; });
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
