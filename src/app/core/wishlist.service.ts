import { computed, inject, Injectable, signal } from '@angular/core';
import { ProductService } from './product.service';
import { load, persist } from './storage';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly productService = inject(ProductService);
  private readonly _ids = signal<number[]>(load('wishlist', []));

  readonly ids = this._ids.asReadonly();
  readonly count = computed(() => this._ids().length);
  readonly products = computed(() =>
    this.productService.products().filter((p) => this._ids().includes(p.id)),
  );

  constructor() {
    persist('wishlist', this._ids);
  }

  has(id: number): boolean {
    return this._ids().includes(id);
  }

  /** Returns true when the item was added, false when removed. */
  toggle(id: number): boolean {
    const adding = !this.has(id);
    this._ids.update((ids) => (adding ? [...ids, id] : ids.filter((x) => x !== id)));
    return adding;
  }
}
