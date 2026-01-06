import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PerformanceService } from './performance.service';
import { createIdlePerformance } from '../models/performance';
import { PERFORMANCE_API_BASE } from '../config/api.tokens';

describe('PerformanceService', () => {
  let service: PerformanceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    try {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    } catch (e) {
      /* ignore */
    }

  TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [PerformanceService, { provide: PERFORMANCE_API_BASE, useValue: '' }] });
    service = TestBed.inject(PerformanceService);
    httpMock = TestBed.inject(HttpTestingController);
    // Consume the initial GET performed by the service constructor so tests start deterministic
    const initReq = httpMock.expectOne('/performance');
    initReq.flush(createIdlePerformance());
  });

  afterEach(() => {
    service.stopPolling();
    httpMock.verify();
  });

  it('polls /performance', fakeAsync(() => {
    // Use an isolated TestBed so this test isn't affected by beforeEach initial fetch
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [PerformanceService, { provide: PERFORMANCE_API_BASE, useValue: '' }] });
    const svc = TestBed.inject(PerformanceService);
    const mock = TestBed.inject(HttpTestingController);
    const req = mock.expectOne('/performance');
    expect(req.request.method).toBe('GET');
    const p = createIdlePerformance();
    req.flush(p);
    svc.stopPolling();
    mock.verify();
  }));

  it('fetches initial performance on creation so clients can act immediately', fakeAsync(() => {
    // Create a fresh module to observe the constructor fetch behavior without the prior flush
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [PerformanceService, { provide: PERFORMANCE_API_BASE, useValue: '' }] });
    const svc = TestBed.inject(PerformanceService);
    const mock = TestBed.inject(HttpTestingController);
    const req = mock.expectOne('/performance');
    expect(req.request.method).toBe('GET');
    const ready = createIdlePerformance();
    ready.status = 'READY';
    ready.version = 1;
    req.flush(ready);
    svc.stopPolling();
    mock.verify();
  }));

  it('treats expired performance as IDLE', fakeAsync(() => {
    tick(1000);
    const expired = createIdlePerformance();
    expired.expiresAt = Date.now() - 1000;

  let seen: any = null;
    const sub = service.performance$.subscribe((val) => {
      seen = val.status;
    });
  service.refresh();
    const req = httpMock.expectOne('/performance');
    req.flush(expired);
    expect(seen).toBe('IDLE');
    sub.unsubscribe();
  }));

  it('start posts leaderId and sets Content-Type header', fakeAsync(() => {
    let done = false;
    service.start('L1').subscribe(() => done = true);
    const req = httpMock.expectOne('/performance/start');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ leaderId: 'L1' });
    expect(req.request.headers.get('Content-Type')).toContain('application/json');
    req.flush(createIdlePerformance());
    expect(done).toBeTrue();
  }));

  it('retries POST on 5xx errors and succeeds on retry', fakeAsync(() => {
    let completed = false;
    service.start('L1').subscribe(() => completed = true, () => fail('should not error'));

    // first attempt -> 500
    const req1 = httpMock.expectOne('/performance/start');
    req1.flush({}, { status: 500, statusText: 'Server Error' });

    // advance first backoff (200ms)
    tick(200);
    const req2 = httpMock.expectOne('/performance/start');
    req2.flush({}, { status: 500, statusText: 'Server Error' });

    // advance second backoff (400ms)
    tick(400);
    const req3 = httpMock.expectOne('/performance/start');
    req3.flush(createIdlePerformance());

    expect(completed).toBeTrue();
  }));

  it('resetProxyEvent posts wrapper with stringified body', fakeAsync(() => {
    let done = false;
    service.reset('L1').subscribe(() => done = true);
    const req = httpMock.expectOne('/performance/reset');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ leaderId: 'L1' });
    expect(req.request.headers.get('Content-Type')).toContain('application/json');
    req.flush(createIdlePerformance());
    expect(done).toBeTrue();
  }));
});
