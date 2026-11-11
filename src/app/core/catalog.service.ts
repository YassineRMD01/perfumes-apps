import { computed, inject, Injectable, signal } from '@angular/core';
import { ImageStore } from './image-store.service';
import { Brand, Category, Lang, ProductKind } from './models';
import { SEED_BRANDS, SEED_CATEGORIES } from './seed';
import { load, migrateOnce, persist } from './storage';

const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'category';

/** Brands and categories, managed by the admin. */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly images = inject(ImageStore);
  private readonly _brands = signal<Brand[]>(load('brands', SEED_BRANDS));
  private readonly _categories = signal<Category[]>(
    // categories saved before cosmetics existed are perfume categories
    load<Category[]>('categories', SEED_CATEGORIES).map((c) => ({ ...c, kind: c.kind ?? 'perfume' })),
  );

  readonly brands = computed(() => [...this._brands()].sort((a, b) => a.name.localeCompare(b.name)));
  readonly categories = this._categories.asReadonly();

  constructor() {
    if (migrateOnce('catalog-cosmetics-v1')) {
      // Add the cosmetic brands and categories to data saved by an earlier version
      const brands = [...this._brands()];
      const taken = new Set(brands.map((b) => b.id));
      let nextId = Math.max(0, ...taken, ...SEED_BRANDS.map((b) => b.id));
      for (const b of SEED_BRANDS.filter((seed) => !brands.some((x) => x.name === seed.name))) {
        const id = taken.has(b.id) ? ++nextId : b.id;
        taken.add(id);
        brands.push({ ...b, id });
      }
      this._brands.set(brands);
      const cats = this._categories();
      this._categories.set([...cats, ...SEED_CATEGORIES.filter((c) => !cats.some((x) => x.id === c.id))]);
    }
    persist('brands', this._brands);
    persist('categories', this._categories);
  }

  categoriesOf(kind: ProductKind | null): Category[] {
    return kind ? this._categories().filter((c) => c.kind === kind) : this._categories();
  }

  brandIdByName(name: string): number | undefined {
    return this._brands().find((b) => b.name === name)?.id;
  }

  // ---- Brands ----
  brand(id: number): Brand | undefined {
    return this._brands().find((b) => b.id === id);
  }

  brandName(id: number): string {
    return this.brand(id)?.name ?? '—';
  }

  createBrand(input: Omit<Brand, 'id' | 'createdAt'>): Brand {
    const brand: Brand = { ...input, id: Math.max(0, ...this._brands().map((b) => b.id)) + 1, createdAt: new Date().toISOString() };
    this._brands.update((list) => [...list, brand]);
    return brand;
  }

  updateBrand(id: number, input: Omit<Brand, 'id' | 'createdAt'>): void {
    const previous = this.brand(id);
    this._brands.update((list) => list.map((b) => (b.id === id ? { ...b, ...input } : b)));
    if (previous?.logo && previous.logo !== input.logo) this.images.remove([previous.logo]);
  }

  deleteBrand(id: number): void {
    const brand = this.brand(id);
    this._brands.update((list) => list.filter((b) => b.id !== id));
    if (brand?.logo) this.images.remove([brand.logo]);
  }

  // ---- Categories ----
  category(id: string): Category | undefined {
    return this._categories().find((c) => c.id === id);
  }

  categoryName(id: string, lang: Lang): string {
    const c = this.category(id);
    return c ? c.name[lang] || c.name.en : '—';
  }

  createCategory(input: Omit<Category, 'id' | 'createdAt'>): Category {
    let id = slugify(input.name.en);
    while (this.category(id)) id += '-2';
    const category: Category = { ...input, id, createdAt: new Date().toISOString() };
    this._categories.update((list) => [...list, category]);
    return category;
  }

  updateCategory(id: string, input: Omit<Category, 'id' | 'createdAt'>): void {
    this._categories.update((list) => list.map((c) => (c.id === id ? { ...c, ...input } : c)));
  }

  deleteCategory(id: string): void {
    this._categories.update((list) => list.filter((c) => c.id !== id));
  }
}
