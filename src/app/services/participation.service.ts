import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PerformanceService } from './performance.service';
import { Performance } from '../models/performance';

@Injectable({ providedIn: 'root' })
export class ParticipationService implements OnDestroy {
  private sub: Subscription;
  private lastJoinedVersion: number | null = null;

  constructor(private perf: PerformanceService) {
    this.sub = this.perf.performance$.subscribe((p: Performance) => {
      if (p.status === 'READY' && p.version !== this.lastJoinedVersion) {
        this.perf.join().subscribe(() => {
          this.lastJoinedVersion = p.version;
        }, () => {
          // ignore errors; counting is approximate
        });
      }
      if (p.status !== 'READY') {
        this.lastJoinedVersion = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
