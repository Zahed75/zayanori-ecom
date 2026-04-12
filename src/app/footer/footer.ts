import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {
  readonly makeMoneyLinks = [
    'Sell on Zayanori',
    'Sell Your Services on Zayanori',
    'Sell on Zayanori Business',
    'Sell Your Apps on Zayanori',
    'Become an Affiliate',
    'Advertise Your Products',
    'Sell-Publish with Us',
    'Become a Zayanori Vendor',
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
    'Careers at Zayanori',
    'About Zayanori',
    'Investor Relations',
    'Zayanori Devices',
    'Customer Reviews',
    'Social Responsibility',
    'Store Locations',
  ];

  readonly socialLinks = [
    { icon: 'pi pi-facebook', label: 'Facebook', href: '#' },
    { icon: 'pi pi-twitter', label: 'Twitter / X', href: '#' },
    { icon: 'pi pi-instagram', label: 'Instagram', href: '#' },
    { icon: 'pi pi-linkedin', label: 'LinkedIn', href: '#' },
    { icon: 'pi pi-youtube', label: 'YouTube', href: '#' },
  ];
}
