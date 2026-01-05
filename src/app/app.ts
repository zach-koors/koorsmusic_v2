import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationError } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HttpClientModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = 'kokozami';
  navError: string | null = null;

  constructor(router: Router) {
    // Log router navigation errors to make lazy-load failures visible in the browser console
    router.events.subscribe((e) => {
      if (e instanceof NavigationError) {
        // eslint-disable-next-line no-console
        console.error('Router NavigationError:', e.error, 'url:', e.url);
        try {
          this.navError = String(e.error?.message || e.error || e.url || 'unknown');
        } catch (err) {
          this.navError = 'unknown';
        }
      }
    });

    // Capture global uncaught errors and promise rejections so we can surface them in the UI
    window.addEventListener('error', (ev: ErrorEvent) => {
      try { this.navError = ev.message || String(ev.error || 'uncaught error'); } catch { this.navError = 'uncaught error'; }
      // eslint-disable-next-line no-console
      console.error('Global error', ev.error || ev.message, ev);
    });

    window.addEventListener('unhandledrejection', (ev: PromiseRejectionEvent) => {
      try { this.navError = String((ev.reason && ev.reason.message) || ev.reason || 'unhandled rejection'); } catch { this.navError = 'unhandled rejection'; }
      // eslint-disable-next-line no-console
      console.error('Unhandled promise rejection', ev.reason, ev);
    });
  }
}
