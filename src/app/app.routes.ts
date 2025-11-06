import { Routes } from '@angular/router';
import { Home } from './pages/kokozami/home/home';
import { KoorsMusic } from './pages/koors-music/koors-music';

export const routes: Routes = [
  { path: '', title: 'KoorsMusic', component: KoorsMusic },
  { path: 'kokozami', title: 'Home', component: Home },
  { path: 'kokozami/about', title: 'About',loadComponent: () => import('./pages/kokozami/about/about').then(m => m.About) },
  { path: 'kokozami/music', title: 'Music', loadComponent: () => import('./pages/kokozami/music/music').then(m => m.Music) },
  { path: 'kokozami/shows', title: 'Shows', loadComponent: () => import('./pages/kokozami/shows/shows').then(m => m.Shows) },
  { path: 'kokozami/contact', title: 'Contact', loadComponent: () => import('./pages/kokozami/contact/contact').then(m => m.Contact) },
  { path: '**', redirectTo: 'kokozami' } // Wildcard route for a 404 page can be added here
];
