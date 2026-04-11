import { Injectable, signal, effect } from '@angular/core';
import { Order, CartItem, ShippingAddress } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly STORAGE_KEY = 'zayanori_orders';

  readonly orders = signal<Order[]>(this.loadFromStorage());

  constructor() {
    effect(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.orders()));
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
  ): Order {
    const order: Order = {
      id: 'ORD-' + Date.now().toString().slice(-6),
      items: [...items],
      subtotal,
      discount,
      shipping,
      total: subtotal - discount + shipping,
      status: 'processing',
      createdAt: new Date(),
      shippingAddress: address,
      paymentMethod: payment,
      couponApplied: coupon,
    };
    this.orders.update(o => [order, ...o]);
    return order;
  }

  cancelOrder(orderId: string): void {
    this.orders.update(orders =>
      orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' as const } : o)
    );
  }

  getById(id: string): Order | undefined {
    return this.orders().find(o => o.id === id);
  }

  private loadFromStorage(): Order[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : this.getDemoOrders();
    } catch { return this.getDemoOrders(); }
  }

  private getDemoOrders(): Order[] {
    return [
      {
        id: 'ORD-001234',
        items: [],
        subtotal: 45.97, discount: 0, shipping: 4.99, total: 50.96,
        status: 'delivered',
        createdAt: new Date('2026-03-15'),
        shippingAddress: { fullName: 'Demo User', phone: '+1234567890', email: 'demo@example.com', address: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'USA' },
        paymentMethod: 'Credit Card',
      },
      {
        id: 'ORD-001198',
        items: [],
        subtotal: 78.50, discount: 15, shipping: 0, total: 63.50,
        status: 'shipped',
        createdAt: new Date('2026-04-01'),
        shippingAddress: { fullName: 'Demo User', phone: '+1234567890', email: 'demo@example.com', address: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'USA' },
        paymentMethod: 'PayPal',
        couponApplied: 'SAVE20',
      },
    ];
  }
}
