import { Component } from '@angular/core';
import { Video } from "../../../components/video/video";
import { Header } from "../../../components/header/header";
import { Footer } from "../../../components/footer/footer";

@Component({
  selector: 'app-about',
  imports: [Video, Header, Footer],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {
  
}
