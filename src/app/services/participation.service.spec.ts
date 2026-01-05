import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PerformanceService } from './performance.service';
import { ParticipationService } from './participation.service';
import { createIdlePerformance } from '../models/performance';

describe('ParticipationService', () => {
  let perf: PerformanceService;
  let part: ParticipationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    try {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    } catch (e) {}

    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [PerformanceService, ParticipationService] });
    perf = TestBed.inject(PerformanceService);
    part = TestBed.inject(ParticipationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    perf.stopPolling();
    httpMock.verify();
  });

  it('posts join on READY', fakeAsync(() => {
  // trigger deterministic refresh which will cause ParticipationService to react
  perf.refresh();
    const ready = createIdlePerformance();
    ready.status = 'READY';
    ready.version = 1;

    const req = httpMock.expectOne('/performance');
    req.flush(ready);

    // ParticipationService should POST /performance/join
    const joinReq = httpMock.expectOne('/performance/join');
    expect(joinReq.request.method).toBe('POST');
    joinReq.flush(ready);
  }));
});
