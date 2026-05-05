import { Component } from '@angular/core';
import { Footer } from '../../../components/footer/footer';
import { Header } from '../../../components/header/header';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  imports: [Header, Footer]
})
export class Home {
  isVideoPlaying = false;
  isCooldown = false;
  isVideoReady = false;

  private readonly cooldownTime = 3000; // ms

  playVideo(): void {
    if (this.isCooldown) return;
    this.isVideoPlaying = true;
    this.isVideoReady = false;
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
