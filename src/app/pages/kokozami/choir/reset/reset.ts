import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RoleService } from '../../../../services/role.service';
import { PerformanceService } from '../../../../services/performance.service';
import type { Performance } from '../../../../models/performance';
import { filter, take, timeout, catchError } from 'rxjs/operators';
import { of, EMPTY } from 'rxjs';

@Component({
  selector: 'app-choir-reset',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reset.html',
  styleUrls: ['./reset.scss']
})
export class Reset implements OnInit {
  status: 'idle' | 'pending' | 'success' | 'error' = 'idle';
  errorMsg: string | null = null;

  constructor(private role: RoleService, private perf: PerformanceService, private router: Router) {}

  ngOnInit(): void {
    this.doReset();
  }

  doReset() {
    const leaderId = this.role.leaderId;
    const tryResetWith = (id: string | null) => {
      if (!id) {
        this.status = 'error';
        this.errorMsg = 'No leader ID available to reset.';
        return;
      }

      this.status = 'pending';
      this.perf.reset(id).subscribe((p: Performance) => {
        this.status = 'success';
        this.role.setLeaderId(null);
          // Immediately refresh server state so UI reflects the reset (avoid stale PLAYING state)
          try { this.perf.refresh(true); } catch (e) { /* ignore */ }
        setTimeout(() => this.router.navigate(['/choir']), 800);
      }, (err: any) => {
        this.status = 'error';
        this.errorMsg = (err && (err as any).message) ? (err as any).message : 'Reset failed';
      });
    };

    if (leaderId) {
      tryResetWith(leaderId);
      return;
    }

    // Wait briefly for the current perf to emit a leaderId (server value) before giving up
    const perf$ = (this.perf as any).performance$;
    if (!perf$ || typeof perf$.pipe !== 'function') {
      this.status = 'error';
      this.errorMsg = 'No leader ID available to reset.';
      return;
    }

    perf$.pipe(
      filter((p: Performance | null) => !!(p && p.leaderId)),
      take(1),
      timeout(2000),
      catchError(() => of(null))
    ).subscribe((p: Performance | null) => {
      if (p && p.leaderId) tryResetWith(p.leaderId);
      else {
        this.status = 'error';
        this.errorMsg = 'No leader ID available to reset.';
      }
    });
  }

  goBack() {
    this.router.navigate(['/choir']);
  }
}
