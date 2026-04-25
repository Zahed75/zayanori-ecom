import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  readonly cart = inject(CartService);
  readonly wishlist = inject(WishlistService);
  readonly auth = inject(AuthService);

  // ── Countdown Timer (notification bar) ───────────────────
  readonly countdown = signal({ days: 47, hours: 6, minutes: 55, seconds: 51 });

  // ── UI state ─────────────────────────────────────────────
  readonly showCategories = signal(false);
  readonly showUserMenu = signal(false);

  // ── Navigation links ─────────────────────────────────────
  readonly navLinks: { label: string; active: boolean; dropdown: boolean; badge?: string; red?: boolean; path: string; queryParams?: any }[] = [
    { label: 'Home', active: true, dropdown: false, path: '/' },
    { label: 'Shop', active: false, dropdown: true, path: '/shop' },
    { label: 'Fruits & Vegetables', active: false, dropdown: false, path: '/shop/grocery' },
    { label: 'Beverages', active: false, dropdown: false, path: '/shop/grocery' },
    { label: 'Blog', active: false, dropdown: false, path: '/blog' },
    { label: 'Contact', active: false, dropdown: false, path: '/contact' },
    { label: 'Trending Products', active: false, dropdown: true, path: '/shop', queryParams: { featured: true } },
    { label: 'Almost Finished', active: false, dropdown: true, badge: 'SALE', red: true, path: '/shop', queryParams: { best_seller: true } },
  ];

  // ── Category list ─────────────────────────────────────────
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
  ] as const;

  constructor() {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.countdown.update(({ days, hours, minutes, seconds }) => {
          if (seconds > 0) return { days, hours, minutes, seconds: seconds - 1 };
          if (minutes > 0) return { days, hours, minutes: minutes - 1, seconds: 59 };
          if (hours > 0) return { days, hours: hours - 1, minutes: 59, seconds: 59 };
          if (days > 0) return { days: days - 1, hours: 23, minutes: 59, seconds: 59 };
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        });
      }, 1000);
    }
  }

  pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  toggleCategories(): void {
    this.showCategories.update(v => !v);
    if (this.showUserMenu()) this.showUserMenu.set(false);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
    if (this.showCategories()) this.showCategories.set(false);
  }

  signOut(): void {
    this.auth.signOut();
    this.showUserMenu.set(false);
  }

  getUserInitials(): string {
    const name = this.auth.currentUser()?.name || '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
