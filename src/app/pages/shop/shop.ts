import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { ToastService } from '../../shared/toast/toast.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginatorModule, SelectModule],
  templateUrl: './shop.html',
  styleUrl: './shop.css'
})
export class ShopComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cart = inject(CartService);
  private wishlist = inject(WishlistService);
  private toast = inject(ToastService);

  categorySlug = signal<string | null>(null);
  products = signal<Product[]>([]);
  isLoading = signal<boolean>(true);
  
  // Pagination State
  totalRecords = signal<number>(0);
  rows = signal<number>(20);
  first = signal<number>(0);
  currentPage = signal<number>(1);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('category');
      this.categorySlug.set(slug);
      this.route.queryParamMap.subscribe(queryParams => {
        const page = parseInt(queryParams.get('page') || '1', 10);
        const size = parseInt(queryParams.get('size') || '20', 10);
        this.currentPage.set(page);
        this.rows.set(size);
        this.first.set((page - 1) * this.rows());
        
        const apiParams: any = {
          page: page,
          page_size: this.rows(),
        };
        if (slug) {
          apiParams.category = slug;
        }
        if (queryParams.has('featured')) apiParams.featured = queryParams.get('featured');
        if (queryParams.has('best_seller')) apiParams.best_seller = queryParams.get('best_seller');

        this.loadProducts(apiParams);
      });
    });
  }

  loadProducts(apiParams: any) {
    this.isLoading.set(true);
    
    this.productService.queryProducts(apiParams).subscribe({
      next: (res) => {
        const items = res.data?.items || [];
        this.totalRecords.set(res.data?.total || items.length);
        this.products.set(this.mapProducts(items));
        this.isLoading.set(false);
      },
      error: () => {
        this.products.set([]);
        this.totalRecords.set(0);
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(event: PaginatorState) {
    const newPage = (event.page || 0) + 1;
    this.rows.set(event.rows || 20);
    this.first.set(event.first || 0);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: newPage, size: this.rows() },
      queryParamsHandling: 'merge'
    });
  }

  private mapProducts(items: any[]): Product[] {
    return items.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category?.name || 'General',
      emoji: p.emoji || '📦',
      rating: p.rating || 0,
      reviews: p.review_count || 0,
      oldPrice: p.old_price ? Number(p.old_price) : undefined,
      price: Number(p.price),
      discount: p.discount,
      badge: p.badge,
      badgeColor: p.badge_color,
      featured: p.is_featured,
      inStock: p.stock_count > 0,
      stockCount: p.stock_count,
      description: p.description,
      highlights: [],
      tags: [],
      sku: `SKU-${p.id}`,
      brand: 'Zayanori',
      images: p.image_url ? [p.image_url] : ['https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800'],
    } as Product));
  }

  addToCart(product: Product): void {
    this.cart.add(product);
    this.toast.success(`"${product.name}" added to cart ✓`);
  }

  toggleWishlist(product: Product): void {
    const wasIn = this.wishlist.has(product.id);
    this.wishlist.toggle(product);
    if (wasIn) {
      this.toast.info(`Removed from wishlist`);
    } else {
      this.toast.success(`Added to wishlist ♥`);
    }
  }

  isInWishlist(id: number): boolean {
    return this.wishlist.has(id);
  }
}
