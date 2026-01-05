import { TestBed } from '@angular/core/testing';
import { RoleService } from './role.service';

describe('RoleService', () => {
  beforeEach(() => {
    localStorage.removeItem('choir:clientId');
    TestBed.configureTestingModule({ providers: [RoleService] });
  });

  it('generates and persists a clientId', () => {
    const s = TestBed.inject(RoleService);
    expect(s.clientId).toBeDefined();
    const stored = localStorage.getItem('choir:clientId');
    expect(stored).toBe(s.clientId);
  });
});
