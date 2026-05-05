import { Routes } from '@angular/router';
import { Home } from './pages/kokozami/home/home';

export const routes: Routes = [
  { path: '', title: 'Home', component: Home },
  { path: 'about', title: 'About',loadComponent: () => import('./pages/kokozami/about/about').then(m => m.About) },
  { path: 'music', title: 'Music', loadComponent: () => import('./pages/kokozami/music/music').then(m => m.Music) },
  { path: 'shows', title: 'Shows', loadComponent: () => import('./pages/kokozami/shows/shows').then(m => m.Shows) },
  { path: 'contact', title: 'Contact', loadComponent: () => import('./pages/kokozami/contact/contact').then(m => m.Contact) },
  { path: 'choir', title: 'Choir', loadComponent: () => import('./pages/kokozami/choir/choir').then(m => m.Choir) },
  { path: 'choir/reset', title: 'Choir Reset', loadComponent: () => import('./pages/kokozami/choir/reset/reset').then(m => m.Reset) },
  { path: 'epk', title: 'EPK', loadComponent: () => import('./pages/kokozami/epk/epk').then(m => m.Epk) },
  { path: '**', redirectTo: '' } // Wildcard route for a 404 page can be added here
];
