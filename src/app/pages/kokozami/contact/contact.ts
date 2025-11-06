import { Component } from '@angular/core';
import { Video } from "../../../components/video/video";
import { Header } from "../../../components/header/header";
import { Footer } from "../../../components/footer/footer";

@Component({
  selector: 'app-contact',
  imports: [Video, Header, Footer],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {

}
