import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home {
  isVideoPlaying = false;
  isCooldown = false;
  isVideoReady = false;

  private readonly cooldownTime = 5000; // ms

  playVideo(): void {
    if (this.isCooldown) return;
    this.isVideoPlaying = true;
    this.isVideoReady = true;
  }

  onVideoLoaded(): void {
    this.isVideoReady = true;
  }

  onVideoEnded(): void {
    this.isVideoPlaying = false;
    this.isCooldown = true;
    setTimeout(() => this.isCooldown = false, this.cooldownTime);
  }
}
