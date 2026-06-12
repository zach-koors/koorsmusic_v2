import { Component } from '@angular/core';
import { Header } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';
import { pickRandomSong, TRACK_ARCHIVES } from '../../../config/archives_songs';
import { Song } from '../../../components/song/song';

@Component({
  selector: 'app-epk',
  templateUrl: './epk.html',
  imports: [Header, Footer, Song],
  styleUrls: ['./epk.scss'],
})
export class Epk {
  randomSong: { title: string; link: string } | null = null;
  trackArchives = TRACK_ARCHIVES;

  ngOnInit() {
    this.randomSong = pickRandomSong();
  }
}
