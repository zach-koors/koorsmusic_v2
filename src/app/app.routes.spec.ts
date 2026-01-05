import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

describe('App routes', () => {
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [provideRouter(routes)] }).compileComponents();
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  });

  it('can navigate to /choir (lazy load component)', async () => {
    await router.navigateByUrl('/choir');
    expect(location.path()).toBe('/choir');
  });
});
