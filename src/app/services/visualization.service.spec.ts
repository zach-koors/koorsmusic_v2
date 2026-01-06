import { TestBed } from '@angular/core/testing';
import { VisualizationService } from './visualization.service';
import { AudioService } from './audio.service';

describe('VisualizationService', () => {
  let service: VisualizationService;
  let audio: AudioService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [VisualizationService, AudioService] });
    service = TestBed.inject(VisualizationService);
    audio = TestBed.inject(AudioService);
  });

  it('starts and stops without throwing', async () => {
    // create a small canvas element
    const c = document.createElement('canvas');
    c.width = 20;
    c.height = 100;
    await audio.ensureContext();
    service.start(c);
    service.stop();
    // basic assertion to satisfy test runner and ensure no exceptions
    expect(true).toBeTrue();
  });
});
