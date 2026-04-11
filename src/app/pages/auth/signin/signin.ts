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

  async signIn(): Promise<void> {
    this.errorMessage.set('');
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Please enter your email and password.');
      return;
    }
    this.loading.set(true);
    await new Promise(r => setTimeout(r, 800));
    const result = this.auth.signIn(this.email(), this.password());
    this.loading.set(false);
    if (result.success) {
      this.router.navigate(['/']);
    } else {
      this.errorMessage.set(result.message);
    }
  }

  signInWithGoogle(): void {
    this.auth.signIn('google.user@gmail.com', 'google-oauth');
    this.router.navigate(['/']);
  }
}
