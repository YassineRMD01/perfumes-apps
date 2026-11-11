import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { Product, Review } from './models';
import { OrderService } from './order.service';
import { SEED_REVIEWS } from './seed';
import { load, persist } from './storage';

export interface RatingStats {
  average: number;
  count: number;
}

/** Customer reviews. Only customers who ordered a perfume can review it (one review each, editable). */
@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly auth = inject(AuthService);
  private readonly orders = inject(OrderService);
  private readonly _reviews = signal<Review[]>(load('reviews', SEED_REVIEWS));

  readonly reviews = computed(() => [...this._reviews()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));

  constructor() {
    persist('reviews', this._reviews);
  }

  forProduct(productId: number): Review[] {
    return this.reviews().filter((r) => r.productId === productId);
  }

  /**
   * Rating shown in the store: the perfume's historical rating (seed / imported) combined
   * with the reviews written on this site.
   */
  stats(p: Pick<Product, 'id' | 'rating' | 'reviews'>): RatingStats {
    const own = this._reviews().filter((r) => r.productId === p.id);
    const count = p.reviews + own.length;
    if (!count) return { average: 0, count: 0 };
    const total = p.rating * p.reviews + own.reduce((s, r) => s + r.rating, 0);
    return { average: Math.round((total / count) * 10) / 10, count };
  }

  /** Breakdown of the written reviews: index 0 = 5 stars … index 4 = 1 star. */
  distribution(productId: number): number[] {
    const own = this.forProduct(productId);
    return [5, 4, 3, 2, 1].map((star) => own.filter((r) => r.rating === star).length);
  }

  myReview(productId: number): Review | undefined {
    const user = this.auth.currentUser();
    return user ? this._reviews().find((r) => r.productId === productId && r.userId === user.id) : undefined;
  }

  /** Signed-in customers who have a (non-cancelled) order containing the perfume. */
  canReview(productId: number): boolean {
    const user = this.auth.currentUser();
    if (!user || user.role !== 'client') return false;
    return this.orders.myOrders().some((o) => o.status !== 'Cancelled' && o.items.some((i) => i.productId === productId));
  }

  submit(productId: number, rating: number, comment: string): void {
    const user = this.auth.currentUser();
    if (!user) return;
    const existing = this.myReview(productId);
    if (existing) {
      this._reviews.update((list) =>
        list.map((r) => (r.id === existing.id ? { ...r, rating, comment: comment.trim(), createdAt: new Date().toISOString() } : r)),
      );
      return;
    }
    const review: Review = {
      id: Math.max(0, ...this._reviews().map((r) => r.id)) + 1,
      productId,
      userId: user.id,
      userName: user.name,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };
    this._reviews.update((list) => [review, ...list]);
  }

  delete(id: number): void {
    this._reviews.update((list) => list.filter((r) => r.id !== id));
  }
}
