import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Footer } from './footer';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

    it('should display the current year in the footer', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const year = new Date().getFullYear().toString();
    expect(compiled.querySelector('footer')?.textContent).toContain(year);
  });

  it('should have a choir button with correct attributes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const choirButton = compiled.querySelector('.choir-button') as HTMLAnchorElement;
    expect(choirButton).toBeTruthy();
    expect(choirButton.textContent?.trim()).toBe('choir');
    expect(choirButton.hasAttribute('routerlink')).toBe(true);
  });
});
