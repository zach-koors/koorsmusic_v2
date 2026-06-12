import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountdownTimer } from './countdown-timer';

describe('CountdownTimer', () => {
  let component: CountdownTimer;
  let fixture: ComponentFixture<CountdownTimer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountdownTimer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountdownTimer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
