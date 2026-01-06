import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Reset } from './reset';
import { RoleService } from '../../../../services/role.service';
import { PerformanceService } from '../../../../services/performance.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('Reset component', () => {
  let fixture: ComponentFixture<Reset>;
  let component: Reset;
  let role: RoleService;
  let perfMock: any;
  let routerSpy: any;

  beforeEach(async () => {
  perfMock = { reset: jasmine.createSpy('reset').and.returnValue(of({})), refresh: jasmine.createSpy('refresh') };
    routerSpy = { navigate: jasmine.createSpy('navigate') };

    await TestBed.configureTestingModule({
      imports: [Reset],
      providers: [
        { provide: PerformanceService, useValue: perfMock },
        RoleService,
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Reset);
    component = fixture.componentInstance;
    role = TestBed.inject(RoleService);
    try { role.setLeaderId('L1'); } catch (e) {}
  });

  it('calls reset when leaderId exists and navigates back on success', fakeAsync(() => {
    fixture.detectChanges();
    tick();
  expect(perfMock.reset).toHaveBeenCalledWith('L1');
  expect(perfMock.refresh).toHaveBeenCalledWith(true);
    // on success, should clear leader and navigate after delay
    expect(role.leaderId).toBeNull();
    tick(800);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/choir']);
  }));

  it('uses server leaderId when local missing', fakeAsync(() => {
    // role has no leaderId; perf provides one
    role.setLeaderId(null);
    (perfMock as any).performance$ = of({ leaderId: 'SERVER_L1' });
    fixture.detectChanges();
    tick();
    expect(perfMock.reset).toHaveBeenCalledWith('SERVER_L1');
  }));

  it('shows error when no leaderId', fakeAsync(() => {
    role.setLeaderId(null);
    fixture.detectChanges();
    tick();
    expect(component.status).toBe('error');
    expect(component.errorMsg).toContain('No leader ID');
  }));
});
