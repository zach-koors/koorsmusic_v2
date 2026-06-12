import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-video',
  imports: [],
  templateUrl: './video.html',
  styleUrl: './video.scss'
})
export class Video {
  @Input() src: string = '';  
  pause(event: Event): void {
    const video = event.currentTarget as HTMLVideoElement;
    if (!video.paused) {
          video.pause();
        } else {
          video.play();
        };
  }
}
