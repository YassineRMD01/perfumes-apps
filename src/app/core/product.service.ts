import { computed, inject, Injectable, signal } from '@angular/core';
import { ImageStore } from './image-store.service';
import { Perfume, PerfumeInput } from './models';
import { SEED_PRODUCTS } from './seed';
import { load, persist } from './storage';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly imageStore = inject(ImageStore);
  private readonly _products = signal<Perfume[]>(
    // Products saved before the wear attributes existed get them from the seed (or sensible defaults)
    load<Perfume[]>('products', SEED_PRODUCTS).map((p) => {
      const seed = SEED_PRODUCTS.find((s) => s.id === p.id);
      return {
        ...p,
        longevity: p.longevity ?? seed?.longevity ?? 'Moderate',
        seasons: p.seasons ?? seed?.seasons ?? ['Spring', 'Summer', 'Autumn', 'Winter'],
        timeOfDay: p.timeOfDay ?? seed?.timeOfDay ?? 'Both',
      };
    }),
  );

  readonly products = this._products.asReadonly();
  readonly featured = computed(() => this._products().filter((p) => p.featured));
  readonly newArrivals = computed(() =>
    [...this._products()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4),
  );
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
    const previous = this.getById(id);
    this._products.update((list) => list.map((p) => (p.id === id ? { ...p, ...input } : p)));
    // Free uploaded photos that were removed from the product
    if (previous) this.imageStore.remove(previous.images.filter((ref) => !input.images.includes(ref)));
  }

  delete(id: number): void {
    const product = this.getById(id);
    this._products.update((list) => list.filter((p) => p.id !== id));
    if (product) this.imageStore.remove(product.images);
  }

  countByBrand(brandId: number): number {
    return this._products().filter((p) => p.brandId === brandId).length;
  }

  countByCategory(categoryId: string): number {
    return this._products().filter((p) => p.categoryId === categoryId).length;
  }

  /** Resolved cover photo (or null to render the SVG bottle). */
  cover(p: Pick<Perfume, 'images'> | undefined): string | null {
    return this.imageStore.resolve(p?.images[0]);
  }

  adjustStock(id: number, delta: number): void {
    this._products.update((list) =>
      list.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)),
    );
  }
}
