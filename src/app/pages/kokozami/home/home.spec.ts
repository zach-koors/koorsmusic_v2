import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isVideoPlaying).toBeFalse();
    expect(component.isCooldown).toBeFalse();
  });

  it('should start playing video when playVideo() is called and not in cooldown', () => {
    component.isCooldown = false;
    component.playVideo();
    expect(component.isVideoPlaying).toBeTrue();
  });

  it('should not start video when in cooldown', () => {
    component.isCooldown = true;
    component.playVideo();
    expect(component.isVideoPlaying).toBeFalse();
  });

  it('should stop video and enter cooldown when onVideoEnded() is called', () => {
    component.isVideoPlaying = true;
    component.onVideoEnded();
    expect(component.isVideoPlaying).toBeFalse();
    expect(component.isCooldown).toBeTrue();
  });

  it('should exit cooldown after cooldownTime passes', fakeAsync(() => {
    component.onVideoEnded();
    expect(component.isCooldown).toBeTrue();

    tick(7776);
    expect(component.isCooldown).toBeTrue();

    tick(1);
    expect(component.isCooldown).toBeFalse();
  }));

  it('should not change cooldown or playing state if video not ended', fakeAsync(() => {
    component.playVideo();
    expect(component.isVideoPlaying).toBeTrue();
    tick(10000); 
    expect(component.isVideoPlaying).toBeTrue();
    expect(component.isCooldown).toBeFalse();
  }));
});
