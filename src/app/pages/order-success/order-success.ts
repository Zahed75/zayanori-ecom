import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/product.model';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-success.html',
  styleUrl: './order-success.css',
})
export class OrderSuccessComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);

  order = signal<Order | undefined>(undefined);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.order.set(this.orderService.getById(id));
  }
}
