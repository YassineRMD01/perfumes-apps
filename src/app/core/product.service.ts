import { computed, Injectable, signal } from '@angular/core';
import { Perfume, PerfumeInput } from './models';
import { SEED_PRODUCTS } from './seed';
import { load, persist } from './storage';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly _products = signal<Perfume[]>(load('products', SEED_PRODUCTS));

  readonly products = this._products.asReadonly();
  readonly featured = computed(() => this._products().filter((p) => p.featured));
  readonly newArrivals = computed(() =>
    [...this._products()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4),
  );
  readonly brands = computed(() => [...new Set(this._products().map((p) => p.brand))].sort());
  readonly maxPrice = computed(() => Math.ceil(Math.max(0, ...this._products().map((p) => p.price)) / 10) * 10);
  readonly lowStock = computed(() => this._products().filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock));

  constructor() {
    persist('products', this._products);
  }

  getById(id: number): Perfume | undefined {
    return this._products().find((p) => p.id === id);
  }

  create(input: PerfumeInput): Perfume {
    const id = Math.max(0, ...this._products().map((p) => p.id)) + 1;
    const perfume: Perfume = { ...input, id, rating: 0, reviews: 0, createdAt: new Date().toISOString() };
    this._products.update((list) => [perfume, ...list]);
    return perfume;
  }

  update(id: number, input: PerfumeInput): void {
    this._products.update((list) => list.map((p) => (p.id === id ? { ...p, ...input } : p)));
  }

  delete(id: number): void {
    this._products.update((list) => list.filter((p) => p.id !== id));
  }

  adjustStock(id: number, delta: number): void {
    this._products.update((list) =>
      list.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)),
    );
  }
}
