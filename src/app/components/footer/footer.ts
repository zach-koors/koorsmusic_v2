import { Component } from '@angular/core';
import { TimeInterval } from 'rxjs';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class AppFooter {
  currentYear = new Date().getFullYear();
}
