import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, Subscription, switchMap, of } from 'rxjs';
import { Performance, createIdlePerformance } from '../models/performance';

@Injectable({ providedIn: 'root' })
export class PerformanceService implements OnDestroy {
  private readonly POLL_MS = 700;
  private pollSub: Subscription | null = null;

  private _performance$ = new BehaviorSubject<Performance>(createIdlePerformance());
  public readonly performance$ = this._performance$.asObservable();

  constructor(private http: HttpClient) {
    this.startPolling();
  }

  private startPolling() {
    if (this.pollSub) return;
    this.pollSub = interval(this.POLL_MS)
      .pipe(switchMap(() => {
        if (typeof document !== 'undefined' && document.hidden) {
          return of(null as Performance | null);
        }
        return this.http.get<Performance>('/performance');
      }))
      .subscribe((p: Performance | null) => {
        if (!p) return;
        if (p.expiresAt && Date.now() > p.expiresAt) {
          this._performance$.next(createIdlePerformance());
        } else {
          this._performance$.next(p);
        }
      }, (err) => {
        console.warn('Performance polling error', err);
      });
  }

  // Public method to fetch and emit the current performance once (manual refresh)
  refresh() {
    if (typeof document !== 'undefined' && document.hidden) return;
    this.http.get<Performance>('/performance').subscribe((p) => {
      if (!p) return;
      if (p.expiresAt && Date.now() > p.expiresAt) {
        this._performance$.next(createIdlePerformance());
      } else {
        this._performance$.next(p);
      }
    }, (err) => console.warn('Performance refresh error', err));
  }

  stopPolling() {
    this.pollSub?.unsubscribe();
    this.pollSub = null;
  }

  claim() {
    return this.http.post<Performance>('/performance/claim', {});
  }

  join() {
    return this.http.post<Performance>('/performance/join', {});
  }

  start(leaderId: string) {
    return this.http.post<Performance>('/performance/start', { leaderId });
  }

  reset(leaderId?: string) {
    return this.http.post<Performance>('/performance/reset', { leaderId });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
