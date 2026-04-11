import { Injectable, signal, computed, effect } from '@angular/core';
import { CartItem, Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'zayanori_cart';

  readonly items = signal<CartItem[]>(this.loadFromStorage());

  readonly totalItems = computed(() =>
    this.items().reduce((sum, i) => sum + i.quantity, 0)
  );

  readonly subtotal = computed(() =>
    this.items().reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  );

  readonly savings = computed(() =>
    this.items().reduce((sum, i) =>
      sum + (i.product.oldPrice - i.product.price) * i.quantity, 0
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
    effect(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items()));
      }
    });
  }

  add(product: Product, qty = 1): void {
    this.items.update(items => {
      const existing = items.find(i => i.product.id === product.id);
      if (existing) {
        return items.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + qty, product.stockCount) }
            : i
        );
      }
      return [...items, { product, quantity: qty }];
    });
  }

  remove(productId: number): void {
    this.items.update(items => items.filter(i => i.product.id !== productId));
  }

  updateQty(productId: number, qty: number): void {
    if (qty <= 0) { this.remove(productId); return; }
    this.items.update(items =>
      items.map(i =>
        i.product.id === productId
          ? { ...i, quantity: Math.min(qty, i.product.stockCount) }
          : i
      )
    );
  }

  clear(): void { this.items.set([]); }

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

  private loadFromStorage(): CartItem[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }
}
