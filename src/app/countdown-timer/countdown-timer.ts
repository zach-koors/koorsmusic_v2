import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, interval, takeWhile } from 'rxjs';

@Component({
  selector: 'app-countdown-timer',
  imports: [CommonModule],
  templateUrl: './countdown-timer.html',
  styleUrl: './countdown-timer.scss'
})
export class CountdownTimer {
  @Input() targetDate: string = new Date().toISOString();
  @Input() preDateText: string = '';

  countdown$ = interval(1000).pipe(
    map(() => this.getTimeDifference()),
    takeWhile(t => t.total >= 0)
  );

  private getTimeDifference() {
    const total = new Date(this.targetDate).getTime() - new Date().getTime();
    
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return { total, days, hours, minutes, seconds };
  }
}