import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Choir } from './choir';
import { PerformanceService } from '../../../services/performance.service';
import { RoleService } from '../../../services/role.service';
import { VisualizationService } from '../../../services/visualization.service';
import { of, BehaviorSubject } from 'rxjs';

describe('Choir', () => {
  let component: Choir;
  let fixture: ComponentFixture<Choir>;
  let perf$: BehaviorSubject<any>;
  let perfMock: any;

  beforeEach(async () => {
    try { localStorage.removeItem('choir:leaderId'); } catch (e) {}

    perf$ = new BehaviorSubject<any>(null);
    perfMock = {
      performance$: perf$.asObservable(),
      claim: jasmine.createSpy('claim').and.returnValue(of({ leaderId: 'L1' })),
      start: jasmine.createSpy('start').and.returnValue(of({})),
      reset: jasmine.createSpy('reset').and.returnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [Choir],
      providers: [
        { provide: PerformanceService, useValue: perfMock },
        RoleService,
        { provide: VisualizationService, useValue: { start: jasmine.createSpy('start'), stop: jasmine.createSpy('stop') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Choir);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('auto-claims when IDLE', fakeAsync(() => {
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

    // click start
    const startBtn = compiled.querySelector('.controls button') as HTMLButtonElement;
    startBtn.click();
    tick();
    expect(perfMock.start).toHaveBeenCalled();
  }));

  it('shows canvas and hides counter when PLAYING', fakeAsync(() => {
    perf$.next({ status: 'PLAYING', startTime: Date.now() + 2000 });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.viz')).toBeTruthy();
    expect(compiled.querySelector('.counter')).toBeFalsy();
  }));
});
