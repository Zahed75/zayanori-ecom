import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../../services/wishlist.service';
import { CartService } from '../../../services/cart.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class WishlistPageComponent {
  readonly wishlist = inject(WishlistService);
  private readonly cart = inject(CartService);

  addToCart(product: Product): void {
    this.cart.add(product);
  }

  removeAndAddToCart(product: Product): void {
    this.cart.add(product);
    this.wishlist.remove(product.id);
  }
}
