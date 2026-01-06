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
    // Use CSS pixel dimensions so drawing aligns with layout and transforms
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

  // clear previous frame (transparent background so canvas doesn't obscure page)
  this.ctx.clearRect(0, 0, width, height);

    // Draw a faint center baseline across the viewport
    const yMid = height / 2;
    this.ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, yMid + 0.5); // 0.5 for crisp 1px line on some devices
    this.ctx.lineTo(width, yMid + 0.5);
    this.ctx.stroke();

    // Draw waveform across the width (left-to-right) with modest amplitude
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
  // Increase waveform amplitude to be more visible (3x larger)
  const amp = Math.max(4, height * 0.18 * 3); // 3x amplitude
    const step = Math.max(1, Math.floor(data.length / width));
    let first = true;
    for (let x = 0; x < width; x++) {
      const idx = Math.min(data.length - 1, Math.floor((x / width) * data.length));
      const v = (data[idx] - 128) / 128; // -1..1
      const y = Math.floor(yMid - v * amp);
      if (first) {
        this.ctx.moveTo(x, y);
        first = false;
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.stroke();

    this.rafId = requestAnimationFrame(this.loop);
  };
}
