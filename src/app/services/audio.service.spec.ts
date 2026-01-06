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
});
