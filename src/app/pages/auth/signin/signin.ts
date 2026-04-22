import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signin.html',
  styleUrl: './signin.css',
})
export class SignInComponent {
  private router = inject(Router);
  private auth = inject(AuthService);

  readonly email = signal('');
  readonly password = signal('');
  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  setEmail(val: string): void { this.email.set(val); }
  setPassword(val: string): void { this.password.set(val); }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  signIn(): void {
    this.errorMessage.set('');
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Please enter your email and password.');
      return;
    }
    this.loading.set(true);
    
    this.auth.signIn(this.email(), this.password()).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.detail || 'Invalid credentials. Please try again.');
      }
    });
  }

  signInWithGoogle(): void {
    // Note: A real backend would need a Google OAuth endpoint
    this.errorMessage.set('Google Sign-In is not currently configured.');
  }
}
