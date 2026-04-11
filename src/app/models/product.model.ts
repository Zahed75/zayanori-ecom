export interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  subCategory?: string;
  emoji: string;
  rating: number;
  reviews: number;
  oldPrice: number;
  price: number;
  discount: number;
  badge?: string;
  badgeColor?: string;
  featured?: boolean;
  inStock: boolean;
  stockCount: number;
  description: string;
  highlights: string[];
  tags: string[];
  sku: string;
  brand: string;
  weight?: string;
  images: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  product: Product;
  addedAt: Date;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  couponApplied?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
}

export interface Coupon {
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
  minOrder: number;
  expiry: Date;
  used: boolean;
  description: string;
}
