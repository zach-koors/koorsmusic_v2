import { Injectable } from '@angular/core';
import { AudioService } from './audio.service';

@Injectable({ providedIn: 'root' })
export class VisualizationService {
  private rafId: number | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor(private audio: AudioService) {}

  start(canvas: HTMLCanvasElement) {
    if (!canvas) return;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.loop();
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private loop = () => {
    if (!this.canvas || !this.ctx) return;
    const analyser = this.audio.getAnalyser();
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, width, height);

    if (analyser) {
      const data = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(data);
      // draw vertical waveform (centered) by sampling a few points
      this.ctx.strokeStyle = 'white';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      const centerX = Math.floor(width / 2);
      const step = Math.max(1, Math.floor(data.length / height));
      for (let i = 0; i < height; i++) {
        const idx = Math.floor((i / height) * data.length);
        const v = (data[idx] - 128) / 128; // -1..1
        const y = Math.floor((height / 2) - v * (height / 2));
        if (i === 0) this.ctx.moveTo(centerX, y);
        else this.ctx.lineTo(centerX - i * 1, y);
      }
      this.ctx.stroke();
    }

    this.rafId = requestAnimationFrame(this.loop);
  };
}
