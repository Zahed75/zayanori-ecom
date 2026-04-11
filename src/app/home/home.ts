import { Component } from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';

export interface Product {
  id: number;
  name: string;
  category: string;
  emoji: string;
  rating: number;
  reviews: number;
  oldPrice: number;
  price: number;
  discount: number;
  badge?: string;
  badgeColor?: string;
  featured?: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {

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

  // ── New Arrivals ──────────────────────────────────────────
  readonly newArrivals: Product[] = [
    { id: 1, name: 'Organic Whole Milk', category: 'Breakfast & Dairy', emoji: '🥛', rating: 4.5, reviews: 14, oldPrice: 18.99, price: 12.99, discount: 32, badge: 'Organic' },
    { id: 2, name: 'Fresh Strawberries', category: 'Fruits', emoji: '🍓', rating: 4.8, reviews: 23, oldPrice: 14.99, price: 9.99, discount: 33 },
    { id: 3, name: 'Sourdough Bread', category: 'Breads & Bakery', emoji: '🍞', rating: 4.6, reviews: 31, oldPrice: 8.50, price: 5.99, discount: 30 },
    { id: 4, name: 'Almond Butter', category: 'Grocery & Staples', emoji: '🥜', rating: 4.4, reviews: 18, oldPrice: 22.00, price: 14.99, discount: 32 },
    { id: 5, name: 'Greek Yogurt', category: 'Breakfast & Dairy', emoji: '🫙', rating: 4.7, reviews: 42, oldPrice: 12.00, price: 7.99, discount: 33, badge: 'Cold Sale', badgeColor: 'blue' },
    { id: 6, name: 'Frozen Berries Mix', category: 'Frozen Foods', emoji: '🫐', rating: 4.3, reviews: 9, oldPrice: 16.99, price: 10.99, discount: 35 },
  ];

  // ── Best Sellers ──────────────────────────────────────────
  readonly bestSellers: Product[] = [
    { id: 7,  name: 'Mixed Salad Greens', category: 'Fruits & Vegetables', emoji: '🥗', rating: 4.6, reviews: 56, oldPrice: 9.99,  price: 5.49,  discount: 45, badge: 'Organic' },
    { id: 8,  name: 'Chicken Breast',     category: 'Meats & Seafood',     emoji: '🍗', rating: 4.9, reviews: 88, oldPrice: 24.99, price: 14.99, discount: 40 },
    { id: 9,  name: 'Orange Juice 1L',    category: 'Beverages',           emoji: '🍊', rating: 4.5, reviews: 34, oldPrice: 7.99,  price: 4.99,  discount: 37, badge: 'Cold Sale', badgeColor: 'blue' },
    { id: 10, name: 'Pasta Penne 500g',   category: 'Grocery & Staples',   emoji: '🍝', rating: 4.2, reviews: 21, oldPrice: 5.99,  price: 3.49,  discount: 42 },
    { id: 11, name: 'Sparkling Water',    category: 'Beverages',           emoji: '💧', rating: 4.4, reviews: 65, oldPrice: 4.50,  price: 2.49,  discount: 45 },
    { id: 12, name: 'Cheddar Cheese',     category: 'Breakfast & Dairy',   emoji: '🧀', rating: 4.7, reviews: 47, oldPrice: 14.99, price: 8.99,  discount: 40, badge: 'Cold Sale', badgeColor: 'blue' },
    { id: 13, name: 'Granola Crunch Bar', category: 'Biscuits & Snacks',   emoji: '🍫', rating: 4.3, reviews: 29, oldPrice: 11.99, price: 6.99,  discount: 42 },
    { id: 14, name: 'Free Range Eggs 12', category: 'Breakfast & Dairy',   emoji: '🥚', rating: 4.8, reviews: 73, oldPrice: 8.99,  price: 4.99,  discount: 44 },
  ];

  // ── Featured Products (4 large cards) ────────────────────
  readonly featuredProducts: Product[] = [
    { id: 15, name: 'Fresh Salmon Fillet', category: 'Meats & Seafood',   emoji: '🐟', rating: 4.9, reviews: 36, oldPrice: 56.67, price: 27.99, discount: 51, featured: true, badge: 'Featured' },
    { id: 16, name: 'Avocado Hass x4',    category: 'Fruits & Vegetables',emoji: '🥑', rating: 4.7, reviews: 48, oldPrice: 18.00, price: 9.99,  discount: 44, featured: true, badge: 'Organic' },
    { id: 17, name: 'Premium Ribeye 1kg', category: 'Meats & Seafood',    emoji: '🥩', rating: 4.8, reviews: 25, oldPrice: 79.99, price: 49.99, discount: 37, featured: true, badge: 'Featured' },
    { id: 18, name: 'Blueberry Smoothie', category: 'Beverages',          emoji: '🫐', rating: 4.6, reviews: 19, oldPrice: 12.99, price: 6.99,  discount: 46, featured: true, badge: 'Cold Sale', badgeColor: 'blue' },
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

  // ── Helpers ───────────────────────────────────────────────
  getStars(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) => {
      if (i < Math.floor(rating)) return 'full';
      if (i < rating) return 'half';
      return 'empty';
    });
  }

  activeSection = 'new-arrivals';
  activeBSTab = 'all';

  readonly bsTabs = ['All', 'Vegetables', 'Fruits', 'Dairy', 'Beverages'];
}
