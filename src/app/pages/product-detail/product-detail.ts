import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  readonly cart = inject(CartService);
  readonly wishlist = inject(WishlistService);

  readonly product = signal<Product | null>(null);
  readonly relatedProducts = signal<Product[]>([]);
  readonly quantity = signal(1);
  readonly toastMessage = signal('');
  readonly toastType = signal<'success' | 'error'>('success');
  readonly showToast = signal(false);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  readonly selectedImageIndex = signal(0);

  readonly isInWishlist = computed(() => {
    const p = this.product();
    return p ? this.wishlist.has(p.id) : false;
  });

  readonly cartItem = computed(() => {
    const p = this.product();
    if (!p) return null;
    return this.cart.items().find(i => i.product.id === p.id) ?? null;
  });

  readonly starsArray = computed(() => {
    const p = this.product();
    if (!p) return [];
    const stars = [];
    const full = Math.floor(p.rating);
    const half = p.rating % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < full) stars.push('full');
      else if (i === full && half) stars.push('half');
      else stars.push('empty');
    }
    return stars;
  });

  readonly stockStatus = computed(() => {
    const p = this.product();
    if (!p) return null;
    if (!p.inStock) return { label: 'Out of Stock', class: 'out-of-stock' };
    if (p.stockCount < 10) return { label: `Low Stock (${p.stockCount} left)`, class: 'low-stock' };
    return { label: 'In Stock', class: 'in-stock' };
  });

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      const product = this.productService.getById(id);
      if (product) {
        this.product.set(product);
        this.relatedProducts.set(this.productService.getRelated(product, 4)());
        this.quantity.set(1);
        this.selectedImageIndex.set(0);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  incrementQty(): void {
    const p = this.product();
    if (!p) return;
    if (this.quantity() < p.stockCount) this.quantity.update(q => q + 1);
  }

  decrementQty(): void {
    if (this.quantity() > 1) this.quantity.update(q => q - 1);
  }

  addToCart(): void {
    const p = this.product();
    if (!p || !p.inStock) return;
    this.cart.add(p, this.quantity());
    this.showNotification(`${p.name} added to cart!`, 'success');
  }

  toggleWishlist(): void {
    const p = this.product();
    if (!p) return;
    this.wishlist.toggle(p);
    const msg = this.wishlist.has(p.id)
      ? `${p.name} added to wishlist!`
      : `${p.name} removed from wishlist.`;
    this.showNotification(msg, 'success');
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.showToast.set(false), 3000);
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  getDiscountSavings(): number {
    const p = this.product();
    if (!p) return 0;
    return p.oldPrice - p.price;
  }

  trackById(_: number, item: Product): number {
    return item.id;
  }
}
