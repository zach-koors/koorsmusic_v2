import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-song',
  standalone: true,
  template: `
    <p>{{ title }}</p>
    <audio controls controlsList="nodownload" [src]="link"></audio>
    <hr class="space">
  `,
  styleUrls: ['./song.scss']
})
export class Song {
  @Input() title!: string;
  @Input() link!: string;
}
