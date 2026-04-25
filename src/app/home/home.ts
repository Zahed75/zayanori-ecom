import { Component, inject, signal } from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { ProductService } from '../services/product.service';
import { ToastService } from '../shared/toast/toast.service';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  readonly cart = inject(CartService);
  readonly wishlist = inject(WishlistService);
  readonly toast = inject(ToastService);
  private readonly productService = inject(ProductService);

  isLoading = signal(true);
  currentPage = signal(1);

  constructor() {
    setTimeout(() => this.isLoading.set(false), 800);
  }

  // Load products from service
  readonly allProducts = this.productService.getAll();
  readonly newArrivals = this.productService.getNewArrivals();
  readonly bestSellers = this.productService.getBestSellers();
  readonly featuredProducts = this.productService.getFeatured();

  // ── Promo banners (3 horizontal cards below hero) ─────────
  readonly promoBanners = [
    {
      title: 'Quality eggs at an\naffordable price',
      sub: 'Do not miss the current offers\nuntil the end of March.',
      emoji: '🥚',
      badge: 'Organic',
      bgFrom: '#f0fdf4',
      bgTo: '#dcfce7',
      cta: 'Shop Now',
    },
    {
      title: 'Snacks that nourish\nour mind and body',
      sub: "Don't miss this opportunity at a\nspecial discount just for this week.",
      emoji: '🍪',
      badge: 'Only This Week',
      bgFrom: '#fdf4ff',
      bgTo: '#fae8ff',
      cta: 'Shop Now',
    },
    {
      title: 'Get everything fresh\nat your doorstep',
      sub: 'The only supermarket that makes\nyour life easier and happier.',
      emoji: '🥦',
      badge: 'Weekend Discount',
      bgFrom: '#eff6ff',
      bgTo: '#dbeafe',
      cta: 'Shop Now',
    },
  ];

  // ── Deal banners (2 side-by-side) ─────────────────────────
  readonly dealBanners = [
    {
      title: 'Make grocery shopping\neasy with us.',
      sub: 'Only the best quality products.',
      emoji: '🛍️',
      cta: 'Shop Now',
      bgFrom: '#fdf4ff',
      bgTo: '#e9d5ff',
    },
    {
      title: 'Get everyday needs\ndelivered to your door.',
      sub: 'Fresh & organic every day.',
      emoji: '🚚',
      cta: 'Shop Now',
      bgFrom: '#ecfdf5',
      bgTo: '#a7f3d0',
    },
  ];

  // ── Health/Info banner ────────────────────────────────────
  readonly healthBanner = {
    title: 'In store or online, your health is our priority.',
    sub: 'Special 50% discount on all health products this month.',
    discount: '50%',
    cta: 'Shop Health',
    emoji: '❤️',
  };

  // ── Popular Companies / Brands ────────────────────────────
  readonly popularBrands = [
    { name: 'FreshFarm', emoji: '🌿', category: 'Organic Farm', products: 142, rating: 4.8, badge: 'Featured' },
    { name: 'DairyBest', emoji: '🐄', category: 'Dairy Products', products: 89,  rating: 4.6, badge: 'Featured' },
    { name: 'SeaChoice', emoji: '🐠', category: 'Seafood & Fish', products: 63,  rating: 4.9, badge: 'Featured' },
    { name: 'BakerHouse', emoji: '🥐', category: 'Baked Goods', products: 117, rating: 4.7, badge: 'Featured' },
  ];

  // ── Categories for grid ────────────────────────────────────
  readonly categories = [
    { icon: 'pi pi-apple', name: 'Fruits & Veggies', color: '#dcfce7', slug: 'grocery' },
    { icon: 'pi pi-star', name: 'Meat & Seafood',   color: '#fee2e2', slug: 'grocery' },
    { icon: 'pi pi-circle', name: 'Dairy & Eggs',     color: '#fef9c3', slug: 'grocery' },
    { icon: 'pi pi-sun', name: 'Bakery',           color: '#fef3c7', slug: 'grocery' },
    { icon: 'pi pi-bolt', name: 'Beverages',        color: '#dbeafe', slug: 'grocery' },
    { icon: 'pi pi-moon', name: 'Frozen Foods',     color: '#e0f2fe', slug: 'grocery' },
    { icon: 'pi pi-th-large', name: 'Snacks',           color: '#fae8ff', slug: 'grocery' },
    { icon: 'pi pi-shopping-cart', name: 'Staples',          color: '#d1fae5', slug: 'grocery' },
    { icon: 'pi pi-home', name: 'Personal Care',    color: '#e0e7ff', slug: 'home-and-garden' },
    { icon: 'pi pi-heart', name: 'Healthcare',       color: '#fce7f3', slug: 'health' },
    { icon: 'pi pi-user', name: 'Baby & Kids',      color: '#ffedd5', slug: 'baby' },
    { icon: 'pi pi-android', name: 'Pet Supplies',     color: '#f0fdf4', slug: 'pets' },
  ];

  // ── Helpers ───────────────────────────────────────────────
  getStars(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) => {
      if (i < Math.floor(rating)) return 'full';
      if (i < rating) return 'half';
      return 'empty';
    });
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

  changePage(page: number): void {
    this.currentPage.set(page);
    this.isLoading.set(true);
    setTimeout(() => this.isLoading.set(false), 600);
  }

  activeSection = 'new-arrivals';
  activeBSTab = 'all';

  readonly bsTabs = ['All', 'Vegetables', 'Fruits', 'Dairy', 'Beverages'];
}
