import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', title: 'Home', component: Home },
  { path: 'about', title: 'About',loadComponent: () => import('./pages/about/about').then(m => m.About) },
  { path: 'music', title: 'Music', loadComponent: () => import('./pages/music/music').then(m => m.Music) },
  { path: 'contact', title: 'Contact', loadComponent: () => import('./pages/contact/contact').then(m => m.Contact) },
  { path: '**', redirectTo: '' } // Wildcard route for a 404 page can be added here
];
