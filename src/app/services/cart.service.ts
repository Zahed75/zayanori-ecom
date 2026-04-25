import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CartItem, Product } from '../models/product.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/cart`;

  readonly items = signal<CartItem[]>([]);

  readonly totalItems = computed(() =>
    this.items().reduce((sum, i) => sum + i.quantity, 0)
  );

  readonly subtotal = computed(() =>
    this.items().reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  );

  readonly savings = computed(() =>
    this.items().reduce((sum, i) =>
      sum + ((i.product.oldPrice || i.product.price) - i.product.price) * i.quantity, 0
    )
  );

  private appliedCoupon = signal<{ code: string; discount: number; type: 'percent' | 'fixed' } | null>(null);

  readonly couponDiscount = computed(() => {
    const c = this.appliedCoupon();
    if (!c) return 0;
    if (c.type === 'percent') return this.subtotal() * c.discount / 100;
    return c.discount;
  });

  readonly shipping = computed(() => this.subtotal() >= 50 ? 0 : 4.99);

  readonly total = computed(() =>
    Math.max(0, this.subtotal() - this.couponDiscount() + this.shipping())
  );

  readonly activeCoupon = computed(() => this.appliedCoupon());

  constructor() {
    // When the user logs in or out, reload the cart
    effect(() => {
      const isAuth = this.authService.isLoggedIn();
      if (isAuth) {
        this.fetchCart();
      } else {
        this.items.set([]);
      }
    });
  }

  fetchCart(): void {
    if (!this.authService.isLoggedIn()) return;
    this.http.get<any>(this.baseUrl).subscribe(res => {
      if (res.success && res.data) {
        this.items.set(res.data.items || []);
      }
    });
  }

  add(product: Product, qty = 1): void {
    if (!this.authService.isLoggedIn()) {
      alert("Please log in to add items to your cart.");
      return;
    }
    
    this.http.post<any>(this.baseUrl, { product_id: product.id, quantity: qty }).subscribe(res => {
      if (res.success && res.data) {
        this.items.set(res.data.items || []);
      }
    });
  }

  remove(productId: number): void {
    // We need the CartItem ID from the backend to delete it, 
    // so we find the cart item that matches the product.
    const cartItem = this.items().find(i => i.product.id === productId);
    if (!cartItem) return;
    // The backend item has an 'id' field, so we cast it to any to access it
    const itemId = (cartItem as any).id;

    this.http.delete<any>(`${this.baseUrl}/${itemId}`).subscribe(res => {
      if (res.success && res.data) {
        this.items.set(res.data.items || []);
      }
    });
  }

  updateQty(productId: number, qty: number): void {
    if (qty <= 0) { this.remove(productId); return; }
    
    const cartItem = this.items().find(i => i.product.id === productId);
    if (!cartItem) return;
    const itemId = (cartItem as any).id;

    this.http.put<any>(`${this.baseUrl}/${itemId}`, { quantity: qty }).subscribe(res => {
      if (res.success && res.data) {
        this.items.set(res.data.items || []);
      }
    });
  }

  clear(): void {
    if (!this.authService.isLoggedIn()) return;
    this.http.delete<any>(this.baseUrl).subscribe(res => {
      if (res.success) {
        this.items.set([]);
      }
    });
  }

  applyCoupon(code: string): { success: boolean; message: string } {
    const coupons: { [key: string]: { discount: number; type: 'percent' | 'fixed'; min: number } } = {
      'ZAYANORI10': { discount: 10, type: 'percent', min: 0 },
      'SAVE20':     { discount: 20, type: 'percent', min: 50 },
      'FLAT15':     { discount: 15, type: 'fixed',   min: 30 },
      'WELCOME5':   { discount: 5,  type: 'fixed',   min: 0 },
      'SYSCOMATIC': { discount: 25, type: 'percent', min: 100 },
    };
    const c = coupons[code.toUpperCase()];
    if (!c) return { success: false, message: 'Invalid coupon code.' };
    if (this.subtotal() < c.min) return { success: false, message: `Minimum order $${c.min} required.` };
    this.appliedCoupon.set({ code: code.toUpperCase(), discount: c.discount, type: c.type });
    const label = c.type === 'percent' ? `${c.discount}%` : `$${c.discount}`;
    return { success: true, message: `Coupon applied! You save ${label}.` };
  }

  removeCoupon(): void { this.appliedCoupon.set(null); }
}
