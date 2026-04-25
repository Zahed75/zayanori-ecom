import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { ToastService } from '../../shared/toast/toast.service';
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
  private toast = inject(ToastService);

  readonly product = signal<Product | null>(null);
  readonly relatedProducts = signal<Product[]>([]);
  readonly quantity = signal(1);
  readonly isLoading = signal(true);
  readonly showToast = signal(false);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  readonly selectedImageIndex = signal(0);
  readonly activeTab = signal<'description' | 'reviews' | 'shipping'>('description');

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
      if (!id) return;
      
      this.isLoading.set(true);
      
      // Try local cache first
      const cachedProduct = this.productService.getById(id);
      if (cachedProduct) {
        this.setProduct(cachedProduct);
      } else {
        // Fetch from API
        this.productService.getProductById(id).subscribe({
          next: (product) => this.setProduct(product),
          error: () => {
            this.product.set(null);
            this.isLoading.set(false);
          }
        });
      }
    });
  }

  private setProduct(product: Product): void {
    this.product.set(product);
    this.relatedProducts.set(this.productService.getRelated(product, 4)());
    this.quantity.set(1);
    this.selectedImageIndex.set(0);
    this.isLoading.set(false);
  }

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  incrementQty(): void {
    const p = this.product();
    if (!p) return;
    if (this.quantity() < (p.stockCount || 100)) this.quantity.update(q => q + 1);
  }

  decrementQty(): void {
    if (this.quantity() > 1) this.quantity.update(q => q - 1);
  }

  addToCart(): void {
    const p = this.product();
    if (!p || !p.inStock) return;
    this.cart.add(p, this.quantity());
    this.toast.success(`"${p.name}" added to cart ✓`);
  }

  toggleWishlist(): void {
    const p = this.product();
    if (!p) return;
    const wasIn = this.wishlist.has(p.id);
    this.wishlist.toggle(p);
    if (wasIn) {
      this.toast.info(`Removed from wishlist`);
    } else {
      this.toast.success(`Added to wishlist ♥`);
    }
  }

  setTab(tab: 'description' | 'reviews' | 'shipping'): void {
    this.activeTab.set(tab);
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  getDiscountSavings(): number {
    const p = this.product();
    if (!p) return 0;
    return (p.oldPrice || 0) - p.price;
  }

  trackById(_: number, item: Product): number {
    return item.id;
  }
}
