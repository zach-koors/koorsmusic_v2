import { Component } from '@angular/core';
import { Video } from "../../../components/video/video";
import { Header } from "../../../components/header/header";
import { Footer } from "../../../components/footer/footer";

@Component({
  selector: 'app-shows',
  imports: [Video, Header, Footer],
  templateUrl: './shows.html',
  styleUrl: './shows.scss'
})
export class Shows {

}
