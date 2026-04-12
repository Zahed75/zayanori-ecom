import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Coupon } from '../../../models/product.model';

@Component({
  selector: 'app-coupons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coupons.html',
  styleUrl: './coupons.css',
})
export class CouponsComponent {
  copiedCode = signal<string>('');

  readonly coupons: Coupon[] = [
    { code: 'ZAYANORI10', discount: 10, type: 'percent', minOrder: 0, expiry: new Date('2026-06-30'), used: false, description: '10% off on all orders. No minimum purchase required.' },
    { code: 'SAVE20', discount: 20, type: 'percent', minOrder: 50, expiry: new Date('2026-05-31'), used: false, description: '20% off on orders above $50. Great for bulk shopping!' },
    { code: 'FLAT15', discount: 15, type: 'fixed', minOrder: 30, expiry: new Date('2026-05-15'), used: false, description: '$15 flat discount on orders above $30.' },
    { code: 'WELCOME5', discount: 5, type: 'fixed', minOrder: 0, expiry: new Date('2026-12-31'), used: false, description: '$5 off for new users. Welcome to Zayanori!' },
    { code: 'SYSCOMATIC', discount: 25, type: 'percent', minOrder: 100, expiry: new Date('2026-07-31'), used: false, description: '25% off on orders above $100. Exclusive partner offer!' },
  ];

  copyCode(code: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    this.copiedCode.set(code);
    setTimeout(() => this.copiedCode.set(''), 2000);
  }

  formatExpiry(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  isExpired(date: Date): boolean {
    return new Date(date) < new Date();
  }
}
