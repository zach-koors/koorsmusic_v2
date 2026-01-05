import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Choir } from './choir';

describe('Choir', () => {
  let component: Choir;
  let fixture: ComponentFixture<Choir>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Choir]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Choir);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
