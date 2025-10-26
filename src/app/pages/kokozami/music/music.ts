import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Song } from './song';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-music',
  imports: [RouterModule, Song, CommonModule],
  templateUrl: './music.html',
  styleUrl: './music.scss'
})
export class Music {
  songs = [
    { title: 'archives', link: 'https://dl.dropbox.com/scl/fi/jemy10uuf0bs9vm2iawsj/01-Archives.mp3?rlkey=oljupy5l4sf8y1yga5mu8zc2f&st=4iuw3kcx&dl=0' },
    { title: 'listen to', link: 'https://dl.dropbox.com/scl/fi/rzecf2rkv4s4dxbmkxm8q/02-Listen-To.mp3?rlkey=ayly1qv55wjco5pjwtco49wl6&st=ppsqkbnk&dl=0' },
    { title: 'each eye jake', link: 'https://dl.dropbox.com/scl/fi/qr3t6g9m7g8a4s0mfhwzz/03-Each-Eye-Jake.mp3?rlkey=306saw4qii2mxuvvwanf5zhbz&st=ppnpypff&dl=0' },
    { title: 'impasse', link: 'https://dl.dropbox.com/scl/fi/lsysg9qclc8k4nvizrc1x/04-Impasse.mp3?rlkey=p2ru2je9aycyfadwkr0acjijl&st=mo4a050d&dl=0' },
    { title: 'formalities', link: 'https://dl.dropbox.com/scl/fi/3ccmf4z4k3gvinl02rmyf/05-Formalities.mp3?rlkey=8g3vykixn9ajmh1nyzd21well&st=3rvd7u48&dl=0' },
    { title: 'no nope', link: 'https://dl.dropbox.com/scl/fi/ny3tmk9977hkyfffv4ywc/06-No-Nope.mp3?rlkey=tj20vfyuaxkvborhpumtcd6y6&st=mdom9i8j&dl=0' },
    { title: 'this singular', link: 'https://dl.dropbox.com/scl/fi/662icajh56qu5ntbg9ayf/07-This-Singular.mp3?rlkey=3ghac99o3cczcq3v41f8s17xc&st=0kycv4gt&dl=0' }
  ];
}
