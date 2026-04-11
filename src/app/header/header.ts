import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  // ── Countdown Timer (notification bar) ───────────────────
  readonly countdown = signal({ days: 47, hours: 6, minutes: 55, seconds: 51 });

  // ── Cart / Wishlist badge counts ─────────────────────────
  readonly cartCount = signal(0);
  readonly wishlistCount = signal(0);

  // ── Category dropdown visibility ─────────────────────────
  readonly showCategories = signal(false);

  // ── Navigation links ─────────────────────────────────────
  readonly navLinks: { label: string; active: boolean; dropdown: boolean; badge?: string; red?: boolean }[] = [
    { label: 'Home', active: true, dropdown: true },
    { label: 'Shop', active: false, dropdown: true },
    { label: 'Fruits & Vegetables', active: false, dropdown: false },
    { label: 'Beverages', active: false, dropdown: false },
    { label: 'Blog', active: false, dropdown: false },
    { label: 'Contact', active: false, dropdown: false },
    { label: 'Trending Products', active: false, dropdown: true },
    { label: 'Almost Finished', active: false, dropdown: true, badge: 'SALE', red: true },
  ];

  // ── Category list ─────────────────────────────────────────
  readonly categories = [
    { emoji: '🍎', name: 'Fruits & Vegetables', arrow: true },
    { emoji: '🥩', name: 'Meats & Seafood', arrow: true },
    { emoji: '🥚', name: 'Breakfast & Dairy', arrow: true },
    { emoji: '🍞', name: 'Breads & Bakery', arrow: true },
    { emoji: '🥤', name: 'Beverages', arrow: true },
    { emoji: '❄️', name: 'Frozen Foods', arrow: false },
    { emoji: '🍪', name: 'Biscuits & Snacks', arrow: false },
    { emoji: '🌾', name: 'Grocery & Staples', arrow: false },
    { emoji: '🧹', name: 'Household Needs', arrow: false },
    { emoji: '💊', name: 'Healthcare', arrow: false },
    { emoji: '👶', name: 'Baby & Pregnancy', arrow: false },
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
  }
}
