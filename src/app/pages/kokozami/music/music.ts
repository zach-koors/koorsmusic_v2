import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Song } from '../../../components/song/song';
import { CommonModule } from '@angular/common';
import { Video } from "../../../components/video/video";
import { Header } from "../../../components/header/header";
import { Footer } from "../../../components/footer/footer";
import { pickRandomSong, TRACK_ARCHIVES } from '../../../config/archives_songs';

@Component({
  selector: 'app-music',
  imports: [RouterModule, Song, CommonModule, Video, Header, Footer],
  templateUrl: './music.html',
  styleUrl: './music.scss'
})
export class Music {
  randomSong: { title: string; link: string } | null = null;
  trackArchives = TRACK_ARCHIVES;

  ngOnInit() {
    this.randomSong = pickRandomSong();
  }
}
