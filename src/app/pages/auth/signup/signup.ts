import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class SignUpComponent {
  private router = inject(Router);
  private auth = inject(AuthService);

  readonly fullName = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');
  readonly agreeTerms = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  setFullName(v: string): void { this.fullName.set(v); }
  setEmail(v: string): void { this.email.set(v); }
  setPhone(v: string): void { this.phone.set(v); }
  setPassword(v: string): void { this.password.set(v); }
  setConfirmPassword(v: string): void { this.confirmPassword.set(v); }
  setAgreeTerms(v: boolean): void { this.agreeTerms.set(v); }
  togglePassword(): void { this.showPassword.update(v => !v); }
  toggleConfirmPassword(): void { this.showConfirmPassword.update(v => !v); }

  readonly passwordStrength = computed((): 'none' | 'weak' | 'medium' | 'strong' => {
    const pw = this.password();
    if (!pw) return 'none';
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  });

  readonly strengthLabel = computed(() => {
    const s = this.passwordStrength();
    if (s === 'none') return '';
    if (s === 'weak') return 'Weak';
    if (s === 'medium') return 'Medium';
    return 'Strong';
  });

  readonly passwordsMatch = computed(() =>
    this.confirmPassword() === '' || this.password() === this.confirmPassword()
  );

  signUp(): void {
    this.errorMessage.set('');
    if (!this.fullName() || !this.email() || !this.password()) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }
    if (!this.passwordsMatch()) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }
    if (this.password().length < 6) {
      this.errorMessage.set('Password must be at least 6 characters.');
      return;
    }
    if (!this.agreeTerms()) {
      this.errorMessage.set('Please agree to the Terms & Conditions.');
      return;
    }
    this.loading.set(true);
    
    this.auth.signUp(this.fullName(), this.email(), this.password(), this.phone() || undefined).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.detail || 'Registration failed. Please try again.');
      }
    });
  }
}
