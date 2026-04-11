import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home-page/home-page').then(m => m.HomePageComponent),
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetailComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart').then(m => m.CartComponent),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout').then(m => m.CheckoutComponent),
  },
  {
    path: 'auth/signin',
    loadComponent: () => import('./pages/auth/signin/signin').then(m => m.SignInComponent),
  },
  {
    path: 'auth/signup',
    loadComponent: () => import('./pages/auth/signup/signup').then(m => m.SignUpComponent),
  },
  {
    path: 'account/orders',
    loadComponent: () => import('./pages/account/orders/orders').then(m => m.OrdersComponent),
  },
  {
    path: 'account/wishlist',
    loadComponent: () => import('./pages/account/wishlist/wishlist').then(m => m.WishlistPageComponent),
  },
  {
    path: 'account/coupons',
    loadComponent: () => import('./pages/account/coupons/coupons').then(m => m.CouponsComponent),
  },
  {
    path: 'order-success/:id',
    loadComponent: () => import('./pages/order-success/order-success').then(m => m.OrderSuccessComponent),
  },
  { path: '**', redirectTo: '' },
];
