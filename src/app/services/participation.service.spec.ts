import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PerformanceService } from './performance.service';
import { ParticipationService } from './participation.service';
import { createIdlePerformance } from '../models/performance';
import { VoicePart } from '../models/voice-part';
import { PERFORMANCE_API_BASE } from '../config/api.tokens';

describe('ParticipationService', () => {
  let perf: PerformanceService;
  let part: ParticipationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    try {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    } catch (e) {}

  TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [PerformanceService, ParticipationService, { provide: PERFORMANCE_API_BASE, useValue: '' }] });
    perf = TestBed.inject(PerformanceService);
    part = TestBed.inject(ParticipationService);
    httpMock = TestBed.inject(HttpTestingController);
    // Consume the initial GET performed by the PerformanceService constructor
    const initReq = httpMock.expectOne('/performance');
    initReq.flush(createIdlePerformance());
  });

  afterEach(() => {
    perf.stopPolling();
    httpMock.verify();
  });

  it('posts join on READY', fakeAsync(() => {
  // spy on refresh so we can assert it was called with force=true later
  const spy = spyOn(perf, 'refresh').and.callThrough();
  // trigger deterministic refresh which will cause ParticipationService to react
  // (service also does an initial refresh on creation, but call again to make test deterministic)
  perf.refresh();
    const ready = createIdlePerformance();
    ready.status = 'READY';
    ready.version = 1;

    const req = httpMock.expectOne('/performance');
    req.flush(ready);

    // ParticipationService should POST /performance/join
    const joinReq = httpMock.expectOne('/performance/join');
    expect(joinReq.request.method).toBe('POST');
    // Simulate server returning updated performance with incremented version and count
    const updated = { ...ready, version: 2, participantCount: 1 };
    joinReq.flush(updated);

    // ParticipationService should have requested an immediate refresh(true)
    const req2 = httpMock.expectOne('/performance');
    req2.flush(updated);
    // assert a refresh was called with true among the calls
    const calledWithTrue = spy.calls.allArgs().some(args => args[0] === true);
    expect(calledWithTrue).toBeTrue();
  }));

  it('does not repeat join for the same version (idempotent)', fakeAsync(() => {
    // trigger READY
    perf.refresh();
    const ready = createIdlePerformance();
    ready.status = 'READY';
    ready.version = 5;
    const req = httpMock.expectOne('/performance');
    req.flush(ready);

    // Trigger join explicitly (subscription timing can be flaky in unit tests)
    // Trigger join twice in quick succession; ensure only one POST is created
    part.joinForPerformance(ready);
    tick();
    part.joinForPerformance(ready);
    tick();
    const joins = httpMock.match('/performance/join');
    expect(joins.length).toBe(1);

    // Finish the join with success
    joins[0].flush({ ...ready, participantCount: 1 });
    // The success handler will trigger an immediate refresh(true) so flush that GET
    const req3 = httpMock.expectOne('/performance');
    req3.flush({ ...ready, participantCount: 1 });
  }));

  it('does not join again if server increments version after join without returning version', fakeAsync(() => {
    perf.refresh();
    const ready = createIdlePerformance();
    ready.status = 'READY';
    ready.version = 10;
    const req = httpMock.expectOne('/performance');
    req.flush(ready);

    // trigger join; server responds without version info
    part.joinForPerformance(ready);
    tick();
    const joinReq = httpMock.expectOne('/performance/join');
    joinReq.flush({});

    // server then reports an incremented version via poll
  perf.refresh();
  // There may be one or more pending /performance GETs (e.g., a refresh triggered by join)
  const pollReqs = httpMock.match('/performance');
  expect(pollReqs.length).toBeGreaterThan(0);
  pollReqs.forEach((r) => r.flush({ ...ready, version: 11, participantCount: 1 }));

  // ensure we did not issue another join for the new version (no additional posts)
  const moreJoins = httpMock.match('/performance/join');
  expect(moreJoins.length).toBe(0);
  }));

  it('emits server and assigned voice parts on successful join', fakeAsync(() => {
    perf.refresh();
    const ready = createIdlePerformance();
    ready.status = 'READY';
    ready.version = 3;
    const req = httpMock.expectOne('/performance');
    req.flush(ready);

    const joinReq = httpMock.expectOne('/performance/join');

    let serverVal: VoicePart | null | undefined;
    let assignedVal: VoicePart | undefined;
    part.serverVoicePart$.subscribe(v => serverVal = v);
    part.assignedVoicePart$.subscribe(v => assignedVal = v);

    spyOn(console, 'log');
    joinReq.flush({ ...ready, version: 4, participantCount: 1, voicePart: 'A' });

  // The service triggers an immediate refresh(true) after join; flush that GET
  const req2 = httpMock.expectOne('/performance');
  req2.flush({ ...ready, version: 4, participantCount: 1 });

    // server voicePart should be 'A' and assigned should be 'A'
    expect(serverVal).toBe('A');
    expect(assignedVal).toBe('A');
    // log should include returned key
    expect((console.log as any).calls.allArgs().some((a: any[]) => a[0] === 'performance/join returned voicePart:' && a[1] === 'A')).toBeTrue();
  }));

  it('falls back to S when server returns null and logs', fakeAsync(() => {
    perf.refresh();
    const ready = createIdlePerformance();
    ready.status = 'READY';
    ready.version = 6;
    const req = httpMock.expectOne('/performance');
    req.flush(ready);

    const joinReq = httpMock.expectOne('/performance/join');
    let serverVal: VoicePart | null | undefined;
    let assignedVal: VoicePart | undefined;
    part.serverVoicePart$.subscribe(v => serverVal = v);
    part.assignedVoicePart$.subscribe(v => assignedVal = v);

    spyOn(console, 'warn');
    joinReq.flush({ ...ready, version: 7, participantCount: 1, voicePart: null });

  // The service triggers an immediate refresh(true) after join; flush that GET
  const req2b = httpMock.expectOne('/performance');
  req2b.flush({ ...ready, version: 7, participantCount: 1 });

    expect(serverVal).toBeNull();
    expect(assignedVal).toBe('S');
    expect((console.warn as any).calls.allArgs().some((a: any[]) => a[0].toString().indexOf('falling back to S') >= 0)).toBeTrue();
  }));

  it('falls back to S on join error and logs', fakeAsync(() => {
    perf.refresh();
    const ready = createIdlePerformance();
    ready.status = 'READY';
    ready.version = 8;
    const req = httpMock.expectOne('/performance');
    req.flush(ready);

    const joinReq = httpMock.expectOne('/performance/join');
    let serverVal: VoicePart | null | undefined;
    let assignedVal: VoicePart | undefined;
    part.serverVoicePart$.subscribe(v => serverVal = v);
    part.assignedVoicePart$.subscribe(v => assignedVal = v);

    spyOn(console, 'warn');
    // Simulate server error responses and allow retry logic to run (postWithRetry retries up to 3 attempts)
    joinReq.flush({}, { status: 500, statusText: 'Server Error' });
    // First backoff: 200ms
    tick(200);
    const retry1 = httpMock.expectOne('/performance/join');
    retry1.flush({}, { status: 500, statusText: 'Server Error' });
    // Second backoff: 400ms
    tick(400);
    const retry2 = httpMock.expectOne('/performance/join');
    retry2.flush({}, { status: 500, statusText: 'Server Error' });
    // After exhausting retries, the error handler should have fired
    tick(800);

    // If any follow-up performance GETs were triggered, flush them to avoid open requests
    const pendingPerf = httpMock.match('/performance');
    pendingPerf.forEach(r => r.flush({ ...ready }));

    expect(serverVal).toBeNull();
    expect(assignedVal).toBe('S');
    // Be robust about console.warn args: check any call arg contains the substring
    const warnCalls = (console.warn as any).calls.allArgs();
    const foundWarn = warnCalls.some((args: any[]) => args.some(a => String(a).indexOf('falling back to S') >= 0));
    expect(foundWarn).toBeTrue();
  }));
});
