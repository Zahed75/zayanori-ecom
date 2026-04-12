import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class CartComponent {
  readonly cart = inject(CartService);
  couponCode = '';
  couponMsg = '';
  couponSuccess = false;

  inc(id: number, current: number, max: number): void {
    if (current < max) this.cart.updateQty(id, current + 1);
  }

  dec(id: number, current: number): void {
    this.cart.updateQty(id, current - 1);
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) return;
    const result = this.cart.applyCoupon(this.couponCode);
    this.couponMsg = result.message;
    this.couponSuccess = result.success;
    if (result.success) this.couponCode = '';
  }

  freeShipProgress(): number {
    return Math.min(100, (this.cart.subtotal() / 50) * 100);
  }

  freeShipRemaining(): number {
    return Math.max(0, 50 - this.cart.subtotal());
  }
}
