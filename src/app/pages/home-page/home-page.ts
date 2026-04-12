import { Component } from '@angular/core';
import { HeroComponent } from '../../hero/hero';
import { HomeComponent } from '../../home/home';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [HeroComponent, HomeComponent],
  template: `<app-hero></app-hero><app-home></app-home>`
})
export class HomePageComponent {}
