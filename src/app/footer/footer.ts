import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {
  readonly makeMoneyLinks = [
    'Sell on Grogin',
    'Sell Your Services on Grogin',
    'Sell on Grogin Business',
    'Sell Your Apps on Grogin',
    'Become an Affiliate',
    'Advertise Your Products',
    'Sell-Publish with Us',
    'Become an Blowwe Vendor',
  ];

  readonly helpLinks = [
    'Accessibility Statement',
    'Your Orders',
    'Returns & Replacements',
    'Shipping Rates & Policies',
    'Refund and Returns Policy',
    'Privacy Policy',
    'Terms and Conditions',
    'Cookie Settings',
    'Help Center',
  ];

  readonly knowUsLinks = [
    'Careers for Grogin',
    'About Grogin',
    'Investor Relations',
    'Grogin Devices',
    'Customer reviews',
    'Social Responsibility',
    'Store Locations',
  ];

  readonly socialLinks = [
    { icon: 'pi pi-facebook', label: 'Facebook' },
    { icon: 'pi pi-twitter', label: 'Twitter / X' },
    { icon: 'pi pi-instagram', label: 'Instagram' },
    { icon: 'pi pi-linkedin', label: 'LinkedIn' },
  ];
}
