import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/product.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class OrdersComponent {
  private readonly orderService = inject(OrderService);

  activeTab = signal<'all' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');

  readonly filteredOrders = computed(() => {
    const tab = this.activeTab();
    const orders = this.orderService.orders();
    if (tab === 'all') return orders;
    return orders.filter(o => o.status === tab);
  });

  readonly tabs = [
    { key: 'all', label: 'All Orders' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ] as const;

  setTab(tab: 'all' | 'processing' | 'shipped' | 'delivered' | 'cancelled'): void {
    this.activeTab.set(tab);
  }

  cancelOrder(id: string): void {
    this.orderService.cancelOrder(id);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled',
      pending: 'status-processing',
    };
    return map[status] || '';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
