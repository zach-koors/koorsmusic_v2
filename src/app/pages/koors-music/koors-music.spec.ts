import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KoorsMusic } from './koors-music';

describe('KoorsMusic', () => {
  let component: KoorsMusic;
  let fixture: ComponentFixture<KoorsMusic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KoorsMusic]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KoorsMusic);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
