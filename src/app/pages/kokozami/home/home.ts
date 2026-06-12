import { Component } from '@angular/core';
import { Footer } from '../../../components/footer/footer';
import { Header } from '../../../components/header/header';
import { VIDEO_LINKS } from '../../../config/videos';

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
  archivesTeaserVideo = VIDEO_LINKS.archivesTeaserVideo;
  videoReleaseDate = '2026-06-05T00:00:00';
  albumReleaseDate = '2026-06-12T00:00:00';
  videoIsReleased = new Date() >= new Date(this.videoReleaseDate);
  albumIsReleased = new Date() >= new Date(this.albumReleaseDate);
 
  ngOnInit() {
    console.log(this.archivesTeaserVideo)
  }

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
