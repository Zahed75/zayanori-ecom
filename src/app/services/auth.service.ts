import { Injectable, signal, computed, effect } from '@angular/core';
import { User } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly USER_KEY = 'zayanori_user';

  readonly currentUser = signal<User | null>(this.loadUser());
  readonly isLoggedIn = computed(() => this.currentUser() !== null);

  constructor() {
    effect(() => {
      if (typeof localStorage === 'undefined') return;
      const u = this.currentUser();
      if (u) localStorage.setItem(this.USER_KEY, JSON.stringify(u));
      else    localStorage.removeItem(this.USER_KEY);
    });
  }

  signUp(name: string, email: string, password: string, phone?: string): { success: boolean; message: string } {
    if (!email || !password) return { success: false, message: 'Email and password are required.' };
    if (password.length < 6) return { success: false, message: 'Password must be at least 6 characters.' };
    const user: User = { id: Date.now().toString(), name, email, phone, createdAt: new Date() };
    this.currentUser.set(user);
    return { success: true, message: 'Account created successfully!' };
  }

  signIn(email: string, password: string): { success: boolean; message: string } {
    if (!email || !password) return { success: false, message: 'Please fill in all fields.' };
    // Demo: any email/password works for showcase
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const user: User = { id: Date.now().toString(), name, email, createdAt: new Date() };
    this.currentUser.set(user);
    return { success: true, message: 'Signed in successfully!' };
  }

  signOut(): void { this.currentUser.set(null); }

  private loadUser(): User | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
