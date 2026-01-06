import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Choir } from './choir';
import { PerformanceService } from '../../../services/performance.service';
import { RoleService } from '../../../services/role.service';
import { VisualizationService } from '../../../services/visualization.service';
import { of, BehaviorSubject } from 'rxjs';
import { AudioService } from '../../../services/audio.service';
import { ParticipationService } from '../../../services/participation.service';

describe('Choir', () => {
  let component: Choir;
  let fixture: ComponentFixture<Choir>;
  let perf$: BehaviorSubject<any>;
  let perfMock: any;

  beforeEach(async () => {
    try { localStorage.removeItem('choir:leaderId'); } catch (e) {}
    try { localStorage.removeItem('choir:audioEnabled'); } catch (e) {}

    perf$ = new BehaviorSubject<any>(null);
    perfMock = {
      performance$: perf$.asObservable(),
      claim: jasmine.createSpy('claim').and.returnValue(of({ leaderId: 'L1' })),
      join: jasmine.createSpy('join').and.returnValue(of({})),
      start: jasmine.createSpy('start').and.returnValue(of({})),
      reset: jasmine.createSpy('reset').and.returnValue(of({}))
    };

    const audioMock = {
      preload: jasmine.createSpy('preload').and.returnValue(Promise.resolve()),
      schedule: jasmine.createSpy('schedule'),
      ensureContext: jasmine.createSpy('ensureContext').and.returnValue(Promise.resolve({ state: 'running' })),
      getAnalyser: jasmine.createSpy('getAnalyser').and.returnValue(null)
    };

    await TestBed.configureTestingModule({
      imports: [Choir],
      providers: [
        { provide: PerformanceService, useValue: perfMock },
        RoleService,
        { provide: VisualizationService, useValue: { start: jasmine.createSpy('start'), stop: jasmine.createSpy('stop') } },
        { provide: AudioService, useValue: audioMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Choir);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('auto-claims when IDLE', fakeAsync(() => {
    perfMock.hasSynced = true;
    perf$.next({ status: 'IDLE' });
    fixture.detectChanges();
    tick();
    expect(perfMock.claim).toHaveBeenCalled();
    // leaderId should be stored
    const role = TestBed.inject(RoleService);
    expect(role.leaderId).toBe('L1');
  }));

  it('shows controls to leader in READY', fakeAsync(() => {
    const role = TestBed.inject(RoleService);
    // simulate that we have leaderId saved
    role.setLeaderId('L1');
    perf$.next({ status: 'READY', participantCount: 3, leaderId: 'L1', version: 1 });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.counter')?.textContent).toContain('3');
    expect(compiled.querySelector('.controls button')).toBeTruthy();

    // preload should have been called
    const audio: any = TestBed.inject(AudioService as any);
    expect(audio.preload).toHaveBeenCalled();

    // click start
    const startBtn = compiled.querySelector('.controls button') as HTMLButtonElement;
    startBtn.click();
    tick();
    expect(perfMock.start).toHaveBeenCalled();
  }));

  it('late-arriving client triggers join when READY', fakeAsync(() => {
    const part = TestBed.inject(ParticipationService as any) as any;
    spyOn(part, 'joinForPerformance').and.callThrough();
    perf$.next({ status: 'READY', participantCount: 1, version: 2 });
    fixture.detectChanges();
    tick();
    expect(part.joinForPerformance).toHaveBeenCalled();
  }));

  it('enables audio when user taps the enable button', fakeAsync(() => {
    // ensure no persisted flag
    try { localStorage.removeItem('choir:audioEnabled'); } catch (e) {}
    perf$.next({ status: 'READY', participantCount: 0 });
    fixture.detectChanges();
    tick();
    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector('.audio-enable button') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    btn.click();
    tick();
    const audio: any = TestBed.inject(AudioService as any);
    expect(audio.ensureContext).toHaveBeenCalled();
    expect(localStorage.getItem('choir:audioEnabled')).toBe('1');
  }));

  it('shows canvas and hides counter when PLAYING', fakeAsync(() => {
    perf$.next({ status: 'PLAYING', startTime: Date.now() + 2000 });
    fixture.detectChanges();
    tick();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.viz')).toBeTruthy();
    expect(compiled.querySelector('.counter')).toBeFalsy();
    const audio: any = TestBed.inject(AudioService as any);
    expect(audio.schedule).toHaveBeenCalled();
  }));
});
