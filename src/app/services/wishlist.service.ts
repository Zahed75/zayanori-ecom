import { Injectable, signal, computed, effect } from '@angular/core';
import { Product, WishlistItem } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly STORAGE_KEY = 'zayanori_wishlist';

  readonly items = signal<WishlistItem[]>(this.loadFromStorage());

  readonly count = computed(() => this.items().length);

  constructor() {
    effect(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items()));
      }
    });
  }

  add(product: Product): void {
    if (this.has(product.id)) return;
    this.items.update(items => [...items, { product, addedAt: new Date() }]);
  }

  remove(productId: number): void {
    this.items.update(items => items.filter(i => i.product.id !== productId));
  }

  toggle(product: Product): void {
    this.has(product.id) ? this.remove(product.id) : this.add(product);
  }

  has(productId: number): boolean {
    return this.items().some(i => i.product.id === productId);
  }

  private loadFromStorage(): WishlistItem[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }
}
