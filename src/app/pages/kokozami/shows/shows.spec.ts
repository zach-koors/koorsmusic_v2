import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Shows } from './shows';

describe('Shows', () => {
  let component: Shows;
  let fixture: ComponentFixture<Shows>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shows],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Shows);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
