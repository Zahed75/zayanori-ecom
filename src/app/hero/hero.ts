import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class HeroComponent {
  readonly activeSlide = signal(0);

  readonly slides = signal([
    {
      badge: 'Weekend Discount',
      heading: 'Get the best quality\nproducts at the\nlowest prices',
      subheading: "We have prepared special discounts for you on grocery products. Don't miss these opportunities...",
      oldPrice: '$56.67',
      newPrice: '$27.99',
      note: "Don't miss this limited time offer.",
      emoji: '🛒',
      bgFrom: '#f0fdf4',
      bgTo: '#dcfce7',
    },
    {
      badge: 'Organic Products',
      heading: 'Quality eggs at an\naffordable price\nfor everyone',
      subheading: 'Do not miss the current offers until the end of March.',
      oldPrice: '$42.00',
      newPrice: '$21.99',
      note: 'Limited stock. Grab it now!',
      emoji: '🥚',
      bgFrom: '#fefce8',
      bgTo: '#fef9c3',
    },
  ]);

  readonly currentSlide = computed(() => this.slides()[this.activeSlide()]);

  readonly categories = [
    { icon: 'pi pi-apple', name: 'Fruits & Vegetables', arrow: true, slug: 'grocery' },
    { icon: 'pi pi-star', name: 'Meats & Seafood', arrow: true, slug: 'grocery' },
    { icon: 'pi pi-circle', name: 'Breakfast & Dairy', arrow: true, slug: 'grocery' },
    { icon: 'pi pi-sun', name: 'Breads & Bakery', arrow: true, slug: 'grocery' },
    { icon: 'pi pi-bolt', name: 'Beverages', arrow: true, slug: 'grocery' },
    { icon: 'pi pi-moon', name: 'Frozen Foods', arrow: false, slug: 'grocery' },
    { icon: 'pi pi-th-large', name: 'Biscuits & Snacks', arrow: false, slug: 'grocery' },
    { icon: 'pi pi-shopping-cart', name: 'Grocery & Staples', arrow: false, slug: 'grocery' },
    { icon: 'pi pi-home', name: 'Household Needs', arrow: false, slug: 'home-and-garden' },
    { icon: 'pi pi-heart', name: 'Healthcare', arrow: false, slug: 'health' },
    { icon: 'pi pi-user', name: 'Baby & Pregnancy', arrow: false, slug: 'baby' },
  ];

  readonly features = [
    { icon: '💳', title: 'Payment only online', desc: 'Fast & secure mobile checkout.' },
    { icon: '📦', title: 'New stocks and sales', desc: 'Fresh arrivals every week.' },
    { icon: '✅', title: 'Quality assurance', desc: 'Every product is inspected.' },
    { icon: '🚚', title: 'Delivery from 1 hour', desc: 'Express same-day delivery.' },
  ] as const;

  goToSlide(index: number): void {
    this.activeSlide.set(index);
  }
}
