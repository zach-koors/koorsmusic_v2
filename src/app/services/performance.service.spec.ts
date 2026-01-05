import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PerformanceService } from './performance.service';
import { createIdlePerformance } from '../models/performance';

describe('PerformanceService', () => {
  let service: PerformanceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [PerformanceService] });
    service = TestBed.inject(PerformanceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    service.stopPolling();
    httpMock.verify();
  });

  it('polls /performance', fakeAsync(() => {
    tick(700);
    const req = httpMock.expectOne('/performance');
    expect(req.request.method).toBe('GET');
    const p = createIdlePerformance();
    req.flush(p);
  }));

  it('treats expired performance as IDLE', fakeAsync(() => {
    tick(700);
    const expired = createIdlePerformance();
    expired.expiresAt = Date.now() - 1000;

  let seen: any = null;
    const sub = service.performance$.subscribe((val) => {
      seen = val.status;
    });

    const req = httpMock.expectOne('/performance');
    req.flush(expired);
    tick();
    expect(seen).toBe('IDLE');
    sub.unsubscribe();
  }));
});
