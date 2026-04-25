import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, WishlistItem } from '../models/product.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/wishlist`;

  readonly items = signal<WishlistItem[]>([]);

  readonly count = computed(() => this.items().length);

  constructor() {
    effect(() => {
      const isAuth = this.authService.isLoggedIn();
      if (isAuth) {
        this.fetchWishlist();
      } else {
        this.items.set([]);
      }
    });
  }

  fetchWishlist(): void {
    if (!this.authService.isLoggedIn()) return;
    this.http.get<any>(this.baseUrl).subscribe(res => {
      if (res.success && res.data) {
        this.items.set(res.data);
      }
    });
  }

  add(product: Product): void {
    if (!this.authService.isLoggedIn()) {
      alert("Please log in to manage your wishlist.");
      return;
    }
    if (this.has(product.id)) return;
    
    this.http.post<any>(`${this.baseUrl}/toggle`, { product_id: product.id }).subscribe(res => {
      if (res.success) {
        this.fetchWishlist(); // Refresh to get correct IDs
      }
    });
  }

  remove(productId: number): void {
    const item = this.items().find(i => i.product.id === productId);
    if (!item) return;
    const itemId = (item as any).id;

    this.http.delete<any>(`${this.baseUrl}/${itemId}`).subscribe(res => {
      if (res.success) {
        this.items.update(items => items.filter(i => i.product.id !== productId));
      }
    });
  }

  toggle(product: Product): void {
    if (!this.authService.isLoggedIn()) {
      alert("Please log in to manage your wishlist.");
      return;
    }
    this.http.post<any>(`${this.baseUrl}/toggle`, { product_id: product.id }).subscribe(res => {
      if (res.success) {
        this.fetchWishlist();
      }
    });
  }

  has(productId: number): boolean {
    return this.items().some(i => i.product.id === productId);
  }
}
