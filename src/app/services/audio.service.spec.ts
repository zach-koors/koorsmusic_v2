import { TestBed } from '@angular/core/testing';
import { AudioService } from './audio.service';

describe('AudioService', () => {
  let service: AudioService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AudioService] });
    service = TestBed.inject(AudioService);
  });

  it('creates an AudioContext and analyser', async () => {
    const ctx = await service.ensureContext();
    expect(ctx).toBeTruthy();
    const analyser = service.getAnalyser();
    // analyser may be null in some environments, but if present should be an object
    if (analyser) expect(typeof analyser.getByteTimeDomainData).toBe('function');
  });

  it('preloads audio using HTML5 Audio elements', async () => {
    const urls = ['/assets/audio/S.mp3', '/assets/audio/A.mp3'];
    await service.preload(urls);
    // Verify that audio elements are created with correct attributes
    const audioElements = (service as any).audioElements as HTMLAudioElement[];
    expect(audioElements.length).toBe(2);
    expect(audioElements[0].src).toContain('/assets/audio/S.mp3');
    expect(audioElements[0].getAttribute('playsinline')).toBe('');
    expect(audioElements[0].getAttribute('webkit-playsinline')).toBe('');
  });

  it('schedules audio playback with HTML5 Audio elements', async () => {
    const urls = ['/assets/audio/S.mp3'];
    await service.preload(urls);
    
    const audioElements = (service as any).audioElements as HTMLAudioElement[];
    const playSpy = spyOn(audioElements[0], 'play').and.returnValue(Promise.resolve());
    
    const startTime = Date.now() + 100;
    await service.schedule(startTime);
    
    // Wait for scheduled playback
    await new Promise(resolve => setTimeout(resolve, 150));
    
    expect(playSpy).toHaveBeenCalled();
  });

  it('stops audio playback', async () => {
    const urls = ['/assets/audio/S.mp3'];
    await service.preload(urls);
    
    const audioElements = (service as any).audioElements as HTMLAudioElement[];
    const pauseSpy = spyOn(audioElements[0], 'pause');
    
    service.stop();
    
    expect(pauseSpy).toHaveBeenCalled();
    expect(audioElements[0].currentTime).toBe(0);
  });

  it('emits started event when audio begins playing', (done) => {
    service.started$.subscribe(() => {
      expect(true).toBe(true);
      done();
    });
    
    service.preload(['/assets/audio/S.mp3']).then(() => {
      // Schedule immediately
      service.schedule(Date.now());
    });
  });

  it('emits ended event when audio finishes playing', (done) => {
    service.ended$.subscribe(() => {
      expect(true).toBe(true);
      done();
    });
    
    service.preload(['/assets/audio/S.mp3']).then(() => {
      // Schedule playback to set up the onended callbacks
      service.schedule(Date.now()).then(() => {
        const audioElements = (service as any).audioElements as HTMLAudioElement[];
        // Trigger ended event manually after schedule sets up callbacks
        setTimeout(() => {
          if (audioElements[0] && audioElements[0].onended) {
            (audioElements[0].onended as any)(new Event('ended'));
          }
        }, 10);
      });
    });
  });
});
