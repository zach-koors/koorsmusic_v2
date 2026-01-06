import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Song } from './song';
import { CommonModule } from '@angular/common';
import { Video } from "../../../components/video/video";
import { Header } from "../../../components/header/header";
import { Footer } from "../../../components/footer/footer";

@Component({
  selector: 'app-music',
  imports: [RouterModule, Song, CommonModule, Video, Header, Footer],
  templateUrl: './music.html',
  styleUrl: './music.scss'
})
export class Music {
  randomSong: { title: string; link: string } | null = null;

  ngOnInit() {
    this.pickRandomSong();
  }
  
  songs = [
    { title: 'archives', link: 'https://dl.dropbox.com/scl/fi/ywjfz2l8bn9jwqpa68s8m/01-Archives.m4a?rlkey=jhkycqaufl5k0h6rfnqo7joxs&dl=0' },
    { title: 'listen to', link: 'https://dl.dropbox.com/scl/fi/b2t57v8hdlmruh9zjf3vx/04-Listen-To.m4a?rlkey=m6h2it4a7kmdjkgksm2pguzsk&dl=0' },
    { title: 'each eye jake', link: 'https://dl.dropbox.com/scl/fi/p562wt5717kyvlosi97jk/02-Each-Eye-Jake.m4a?rlkey=ndqnpkjz16o4srnt4pdei13hz&dl=0' },
    { title: 'impasse', link: 'https://dl.dropbox.com/scl/fi/kr7ybz890va3o3sopct22/03-Impasse.m4a?rlkey=t6ktnstdw879f95hkha2yy7xf&dl=0' },
    { title: 'formalities', link: 'https://dl.dropbox.com/scl/fi/hp9gbtzmev3r4d1u7ppmm/05-Formalities.m4a?rlkey=kxakqaekb5afboak51sxvue94&dl=0' },
    { title: 'no nope', link: 'https://dl.dropbox.com/scl/fi/uig5zf1kzn65oxawb89qa/06-No-Nope.m4a?rlkey=ybvy7bm6g1k9o03srrgtk8hv1&dl=0' },
    { title: 'this singular', link: 'https://dl.dropbox.com/scl/fi/d3lbd7c9032obmzgx3w5j/07-This-Singular.m4a?rlkey=wu4ue5ywn0d76b0i2epqd2shf&dl=0' },
    { title: 'each eye jake (alt. version)', link: 'https://dl.dropbox.com/scl/fi/ztws4q1n9db0jsxe1sao6/08-Each-Eye-Jake-alternate-version.m4a?rlkey=25b8vyle7gx75cwjnrgqytrji&dl=0' }

  ];

  pickRandomSong() {
    const randomIndex = Math.floor(Math.random() * (this.songs.length - 1)) + 1;
    this.randomSong = this.songs[randomIndex];
  }
}
