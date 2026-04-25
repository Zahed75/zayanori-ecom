import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { ShippingAddress } from '../../models/product.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class CheckoutComponent implements OnInit {
  private readonly cart = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      alert('Please log in or create an account to proceed to checkout.');
      this.router.navigate(['/auth/signin']);
    }
  }

  readonly cartItems = this.cart.items;
  readonly subtotal = this.cart.subtotal;
  readonly shipping = this.cart.shipping;
  readonly couponDiscount = this.cart.couponDiscount;
  readonly total = this.cart.total;
  readonly activeCoupon = this.cart.activeCoupon;

  step = signal<'shipping' | 'payment' | 'review'>('shipping');

  address: ShippingAddress = {
    fullName: '', phone: '', email: '',
    address: '', city: '', state: '', zip: '', country: 'USA'
  };

  paymentMethod = 'card';
  cardNumber = '';
  cardExpiry = '';
  cardCvc = '';

  errors: Record<string, string> = {};

  goToPayment(): void {
    this.errors = {};
    if (!this.address.fullName) this.errors['fullName'] = 'Name is required';
    if (!this.address.email) this.errors['email'] = 'Email is required';
    if (!this.address.phone) this.errors['phone'] = 'Phone is required';
    if (!this.address.address) this.errors['address'] = 'Address is required';
    if (!this.address.city) this.errors['city'] = 'City is required';
    if (!this.address.state) this.errors['state'] = 'State is required';
    if (!this.address.zip) this.errors['zip'] = 'ZIP code is required';
    if (Object.keys(this.errors).length) return;
    this.step.set('payment');
  }

  goToReview(): void {
    this.errors = {};
    if (this.paymentMethod === 'card') {
      if (!this.cardNumber || this.cardNumber.length < 16) this.errors['cardNumber'] = 'Valid card number required';
      if (!this.cardExpiry) this.errors['cardExpiry'] = 'Expiry required';
      if (!this.cardCvc || this.cardCvc.length < 3) this.errors['cardCvc'] = 'CVC required';
    }
    if (Object.keys(this.errors).length) return;
    this.step.set('review');
  }

  isPlacingOrder = signal<boolean>(false);

  placeOrder(): void {
    if (this.isPlacingOrder()) return;
    this.isPlacingOrder.set(true);

    this.orderService.placeOrder(
      this.cart.items(),
      this.subtotal(),
      this.couponDiscount(),
      this.shipping(),
      this.address,
      this.paymentMethod === 'card' ? 'Credit Card' : this.paymentMethod === 'paypal' ? 'PayPal' : 'Cash on Delivery',
      this.activeCoupon()?.code
    ).subscribe({
      next: (res) => {
        this.cart.clear();
        this.cart.removeCoupon();
        this.isPlacingOrder.set(false);
        // Navigate to success page using the backend order ID
        this.router.navigate(['/order-success', res.data.id]);
      },
      error: (err) => {
        console.error('Failed to place order', err);
        alert(err.error?.message || 'Failed to place order. Please try again.');
        this.isPlacingOrder.set(false);
      }
    });
  }
}
