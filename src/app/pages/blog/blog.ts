import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="empty-state">
        <i class="pi pi-pencil empty-icon"></i>
        <h1>Blog</h1>
        <p>Our blog is currently under construction. Check back soon for exciting updates, tips, and articles!</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 6rem 2rem;
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
    }
    .empty-state {
      text-align: center;
      max-width: 500px;
      padding: 3rem;
      background: white;
      border-radius: 24px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.05);
    }
    .empty-icon {
      font-size: 4rem;
      color: var(--color-brand-purple);
      margin-bottom: 1.5rem;
      padding: 1.5rem;
      background: #f5f3ff;
      border-radius: 50%;
    }
    h1 {
      font-size: 2rem;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 1rem;
    }
    p {
      color: #64748b;
      line-height: 1.6;
      font-size: 1.1rem;
    }
  `]
})
export class BlogComponent {}
