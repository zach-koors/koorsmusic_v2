import { Injectable, OnDestroy, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, Subscription, switchMap, of, retryWhen, mergeMap, timer, throwError } from 'rxjs';
import { Performance, createIdlePerformance } from '../models/performance';
import { PERFORMANCE_API_BASE } from '../config/api.tokens';

@Injectable({ providedIn: 'root' })
export class PerformanceService implements OnDestroy {
  private readonly POLL_MS = 800;
  // When a performance is PLAYING reduce polling frequency to save battery/network
  private readonly LONG_POLL_MS = 15_000;
  private pollMs = this.POLL_MS;
  private pollSub: Subscription | null = null;

  private _performance$ = new BehaviorSubject<Performance>(createIdlePerformance());
  public readonly performance$ = this._performance$.asObservable();
  private _hasSynced = false;
  get hasSynced() { return this._hasSynced; }

  constructor(private http: HttpClient, @Inject(PERFORMANCE_API_BASE) private base: string) {
    this.startPolling();
    this.refresh();
  }

  private buildUrl(path: string) {
    if (!this.base) return path;
    const base = this.base.replace(/\/$/, '');
    return `${base}${path.startsWith('/') ? path : '/' + path}`;
  }

  private startPolling() {
    if (this.pollSub) return;
    this.pollSub = interval(this.pollMs)
      .pipe(switchMap(() => {
        if (typeof document !== 'undefined' && document.hidden) {
          return of(null as Performance | null);
        }
        return this.http.get<Performance>(this.buildUrl('/performance'));
      }))
      .subscribe((p: Performance | null) => {
        if (!p) return;
        // Mark that we've successfully obtained a server state at least once
        if (!this._hasSynced) this._hasSynced = true;
        if (p.expiresAt && Date.now() > p.expiresAt) {
          this._performance$.next(createIdlePerformance());
        } else {
          this._performance$.next(p);
          // adjust poll interval based on state to reduce load while PLAYING
          if (p.status === 'PLAYING' && this.pollMs !== this.LONG_POLL_MS) {
            this.restartPollingWith(this.LONG_POLL_MS);
          } else if (p.status !== 'PLAYING' && this.pollMs !== this.POLL_MS) {
            this.restartPollingWith(this.POLL_MS);
          }
        }
      }, (err) => {
        console.warn('Performance polling error', err);
      });
  }

  private restartPollingWith(ms: number) {
    this.stopPolling();
    this.pollMs = ms;
    // start again
    this.startPolling();
  }

  private postWithRetry(path: string, body: unknown) {
    const headers = { 'Content-Type': 'application/json' };
    const maxAttempts = 3;
    return this.http.post<Performance>(this.buildUrl(path), body, { headers }).pipe(
      retryWhen((errors) => errors.pipe(
        mergeMap((err: any, i: number) => {
          const attempt = i + 1;
          // Don't retry for client errors (4xx) except network (status === 0)
          if (err && err.status && err.status < 500 && err.status !== 0) {
            return throwError(() => err);
          }
          if (attempt >= maxAttempts) {
            return throwError(() => err);
          }
          const delayMs = 200 * Math.pow(2, i); // 200, 400, 800
          return timer(delayMs);
        })
      ))
    );
  }

  // Public method to fetch and emit the current performance once (manual refresh)
  refresh(force = false) {
  if (!force && typeof document !== 'undefined' && document.hidden) return;
  this.http.get<Performance>(this.buildUrl('/performance')).subscribe((p) => {
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
    return this.postWithRetry('/performance/claim', {});
  }

  join() {
    return this.postWithRetry('/performance/join', {});
  }

  start(leaderId: string) {
    return this.postWithRetry('/performance/start', { leaderId });
  }

  reset(leaderId?: string) {
    return this.postWithRetry('/performance/reset', { leaderId });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
