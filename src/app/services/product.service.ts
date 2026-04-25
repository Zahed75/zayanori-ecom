import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/products?page_size=100`;

  // We maintain a central state signal for all products
  private readonly productsSignal = signal<Product[]>([]);
  public readonly isLoading = signal<boolean>(true);

  constructor() {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.isLoading.set(true);
    // The backend returns { items: [], total: 0, page: 1, ... }
    this.http.get<any>(this.baseUrl).subscribe({
      next: (response) => {
        // The backend returns { success: true, data: { items: [], ... } }
        const productsData = response.data?.items || [];
        const mappedProducts: Product[] = productsData.map((p: any) => ({
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
          description: p.description || 'Premium quality product curated for your daily needs. Sustainably sourced and carefully packaged to ensure maximum freshness and satisfaction.',
          highlights: p.highlights && p.highlights.length > 0 ? p.highlights : [
            'Premium Quality Guaranteed',
            'Sustainably Sourced',
            'Freshness Guaranteed',
            'Secure Packaging'
          ],
          tags: p.tags || ['Fresh', 'Organic', 'Premium'],
          sku: p.sku || `SKU-${p.id.toString().padStart(6, '0')}`,
          brand: p.brand || 'Zayanori',
          weight: p.weight || '500g',
          images: p.image_url ? [p.image_url] : ['https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800'],
          // extra flags for filtering
          is_new_arrival: p.is_new_arrival,
          is_best_seller: p.is_best_seller
        } as Product & { is_new_arrival?: boolean, is_best_seller?: boolean }));

        this.productsSignal.set(mappedProducts);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load products from API', err);
        this.isLoading.set(false);
      }
    });
  }

  // Return computed signals instead of raw arrays so UI updates reactively
  getAll() { return computed(() => this.productsSignal()); }
  
  getNewArrivals(limit = 6) { 
    return computed(() => this.productsSignal().filter((p: any) => p.is_new_arrival).slice(0, limit)); 
  }
  
  getFeatured(limit = 4) { 
    return computed(() => this.productsSignal().filter(p => p.featured).slice(0, limit)); 
  }
  
  getBestSellers(limit = 8) { 
    return computed(() => this.productsSignal().filter((p: any) => p.is_best_seller).slice(0, limit)); 
  }

  getById(id: number): Product | undefined {
    return this.productsSignal().find(p => p.id === id);
  }

  getProductById(id: number) {
    return this.http.get<any>(`${environment.apiUrl}/products/${id}`).pipe(
      map(response => this.mapSingleProduct(response.data))
    );
  }

  private mapSingleProduct(p: any): Product {
    return {
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
      description: p.description || 'Premium quality product curated for your daily needs. Sustainably sourced and carefully packaged to ensure maximum freshness and satisfaction.',
      highlights: p.highlights && p.highlights.length > 0 ? p.highlights : [
        'Premium Quality Guaranteed',
        'Sustainably Sourced',
        'Freshness Guaranteed',
        'Secure Packaging'
      ],
      tags: p.tags || ['Fresh', 'Organic', 'Premium'],
      sku: p.sku || `SKU-${p.id.toString().padStart(6, '0')}`,
      brand: p.brand || 'Zayanori',
      weight: p.weight || '500g',
      images: p.image_url ? [p.image_url] : ['https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800'],
    } as Product;
  }

  getBySlug(slug: string): Product | undefined {
    return this.productsSignal().find(p => p.slug === slug);
  }

  getRelated(product: Product, limit = 4) {
    return computed(() => this.productsSignal()
      .filter(p => p.id !== product.id && p.category === product.category)
      .slice(0, limit));
  }

  getProductsByCategory(categorySlug: string) {
    return this.http.get<any>(`${environment.apiUrl}/products?category=${categorySlug}&page_size=100`);
  }

  queryProducts(params: any) {
    // filter out null/undefined
    const queryParams: string[] = [];
    for (const key in params) {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.push(`${key}=${params[key]}`);
      }
    }
    const queryStr = queryParams.length ? `?${queryParams.join('&')}` : '';
    return this.http.get<any>(`${environment.apiUrl}/products${queryStr}`);
  }
}
