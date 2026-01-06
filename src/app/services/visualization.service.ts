import { Injectable } from '@angular/core';
import { AudioService } from './audio.service';

@Injectable({ providedIn: 'root' })
export class VisualizationService {
  private rafId: number | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private resizeHandler: (() => void) | null = null;

  constructor(private audio: AudioService) {}

  start(canvas: HTMLCanvasElement) {
    if (!canvas) return;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resizeCanvas();
    this.resizeHandler = () => this.resizeCanvas();
    window.addEventListener('resize', this.resizeHandler);
    this.loop();
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
  }

  private resizeCanvas() {
    if (!this.canvas || !this.ctx) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private loop = () => {
    if (!this.canvas || !this.ctx) return;
    const analyser = this.audio.getAnalyser();
    if (!analyser) {
      // nothing to draw yet
      this.rafId = requestAnimationFrame(this.loop);
      return;
    }
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, width, height);

    if (analyser) {
      const data = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(data);
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
