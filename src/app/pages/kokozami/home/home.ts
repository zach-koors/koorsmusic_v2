import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home {
  isVideoPlaying = false;
  isCooldown = false;
  private cooldownTime = 7777;

  playVideo(): void {
    if (this.isCooldown) return;
    this.isVideoPlaying = true;
  }

  onVideoEnded(): void {
    this.isVideoPlaying = false;
    this.isCooldown = true;

    setTimeout(() => {
      this.isCooldown = false;
    }, this.cooldownTime);
  }
}
