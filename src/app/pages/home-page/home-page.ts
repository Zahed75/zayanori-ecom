import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroComponent } from '../../hero/hero';
import { HomeComponent } from '../../home/home';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [HeroComponent, HomeComponent, RouterLink],
  template: `<app-hero></app-hero><app-home></app-home>`
})
export class HomePageComponent {}
