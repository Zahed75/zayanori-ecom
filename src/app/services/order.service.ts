import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order, CartItem, ShippingAddress } from '../models/product.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/orders`;

  readonly orders = signal<Order[]>([]);

  constructor() {
    effect(() => {
      const isAuth = this.authService.isLoggedIn();
      if (isAuth) {
        this.fetchOrders();
      } else {
        this.orders.set([]);
      }
    });
  }

  fetchOrders(): void {
    if (!this.authService.isLoggedIn()) return;
    this.http.get<any>(this.baseUrl).subscribe(res => {
      if (res.success && res.data) {
        this.orders.set(res.data);
      }
    });
  }

  placeOrder(
    items: CartItem[],
    subtotal: number,
    discount: number,
    shipping: number,
    address: ShippingAddress,
    payment: string,
    coupon?: string
  ): Observable<any> {
    const payload = {
      coupon_code: coupon,
      shipping_name: address.fullName,
      shipping_email: address.email,
      shipping_phone: address.phone,
      shipping_address: address.address,
      shipping_city: address.city,
      shipping_country: address.country,
      payment_method: payment,
      notes: ''
    };

    return this.http.post<any>(this.baseUrl, payload);
  }

  cancelOrder(orderId: string | number): void {
    this.http.post<any>(`${this.baseUrl}/${orderId}/cancel`, {}).subscribe(res => {
      if (res.success) {
        this.fetchOrders();
      }
    });
  }

  getById(id: string | number): Order | undefined {
    return this.orders().find(o => o.id === id);
  }
}
