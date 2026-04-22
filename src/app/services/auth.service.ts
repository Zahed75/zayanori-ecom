import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/product.model';
import { environment } from '../../environments/environment';
import { tap, catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly TOKEN_KEY = 'zayanori_token';
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  readonly currentUser = signal<User | null>(null);
  readonly isLoggedIn = computed(() => this.currentUser() !== null);

  constructor() {
    this.loadTokenAndUser();
  }

  private loadTokenAndUser(): void {
    if (typeof localStorage === 'undefined') return;
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      // Validate token by fetching the user profile
      this.http.get<User>(`${this.baseUrl}/me`).pipe(
        catchError(() => {
          this.signOut();
          return of(null);
        })
      ).subscribe(user => {
        if (user) {
          this.currentUser.set(user);
        }
      });
    }
  }

  signUp(name: string, email: string, password: string, phone?: string): Observable<{ success: boolean; message: string }> {
    if (!email || !password) return of({ success: false, message: 'Email and password are required.' });
    if (password.length < 6) return of({ success: false, message: 'Password must be at least 6 characters.' });
    
    return this.http.post(`${this.baseUrl}/register`, { name, email, password, phone }).pipe(
      map(() => ({ success: true, message: 'Account created successfully! You can now log in.' })),
      catchError(err => of({ success: false, message: err.error?.detail || 'Failed to create account.' }))
    );
  }

  signIn(email: string, password: string): Observable<{ success: boolean; message: string }> {
    if (!email || !password) return of({ success: false, message: 'Please fill in all fields.' });
    
    // FastAPI expects form data for OAuth2
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    return this.http.post<{ access_token: string; token_type: string }>(`${this.baseUrl}/login`, formData).pipe(
      tap(response => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(this.TOKEN_KEY, response.access_token);
        }
        // Fetch profile immediately after login
        this.http.get<User>(`${this.baseUrl}/me`).subscribe(user => this.currentUser.set(user));
      }),
      map(() => ({ success: true, message: 'Signed in successfully!' })),
      catchError(err => of({ success: false, message: 'Invalid credentials or server error.' }))
    );
  }

  signOut(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.currentUser.set(null);
  }

  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }
}
