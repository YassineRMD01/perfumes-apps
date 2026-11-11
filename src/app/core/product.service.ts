import { computed, inject, Injectable, signal } from '@angular/core';
import { ImageStore } from './image-store.service';
import { Variant, variantId } from './models';
import { defaultVariant, summarize } from './variants';

export { defaultVariant, sortVariants, summarize } from './variants';
import { Product, ProductInput } from './models';
import { CatalogService } from './catalog.service';
import { SEED_BRANDS, SEED_PRODUCTS } from './seed';
import { load, migrateOnce, persist } from './storage';

/** Fill fields added in later versions (wear guide, cosmetics, sizes) on products saved earlier. */
function normalize(p: Product): Product {
  const seed = SEED_PRODUCTS.find((s) => s.id === p.id && s.name === p.name);
  // Products saved before sizes existed: their single size becomes a full-size variant;
  // demo perfumes also get the demo decants.
  let variants = p.variants;
  if (!variants?.length) {
    const unit = p.unit ?? 'ml';
    const bottle: Variant = { id: variantId({ type: 'bottle', size: p.volumeMl, unit }), type: 'bottle', size: p.volumeMl, unit, price: p.price, oldPrice: p.oldPrice ?? null, stock: p.stock };
    const extra = (seed?.variants ?? []).filter((v) => v.id !== bottle.id && (v.type === 'decant' || v.size !== bottle.size));
    variants = [bottle, ...extra];
  }
  return summarize({
    ...p,
    variants,
    kind: p.kind ?? 'perfume',
    unit: p.unit ?? 'ml',
    longevity: p.longevity ?? seed?.longevity ?? 'Moderate',
    seasons: p.seasons ?? seed?.seasons ?? ['Spring', 'Summer', 'Autumn', 'Winter'],
    timeOfDay: p.timeOfDay ?? seed?.timeOfDay ?? 'Both',
    skinTypes: p.skinTypes ?? [],
    ingredients: p.ingredients ?? [],
    howToUse: p.howToUse ?? '',
    packaging: p.packaging ?? 'bottle',
  });
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly imageStore = inject(ImageStore);
  private readonly catalog = inject(CatalogService);
  private readonly _products = signal<Product[]>(load<Product[]>('products', SEED_PRODUCTS).map(normalize));

  readonly products = this._products.asReadonly();
  readonly featured = computed(() => this._products().filter((p) => p.featured));
  readonly perfumes = computed(() => this._products().filter((p) => p.kind === 'perfume'));
  readonly cosmetics = computed(() => this._products().filter((p) => p.kind === 'cosmetic'));
  readonly newArrivals = computed(() =>
    [...this._products()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4),
  );
  readonly maxPrice = computed(() => Math.ceil(Math.max(0, ...this._products().map((p) => p.price)) / 10) * 10);
  readonly lowStock = computed(() => this._products().filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock));

  constructor() {
    if (migrateOnce('products-cosmetics-v1')) {
      // Add the demo cosmetics to catalogs saved by an earlier version (ids/brands remapped if taken)
      const list = this._products();
      const taken = new Set(list.map((p) => p.id));
      let nextId = Math.max(0, ...taken, ...SEED_PRODUCTS.map((p) => p.id));
      const added = SEED_PRODUCTS.filter((p) => p.kind === 'cosmetic' && !list.some((x) => x.name === p.name)).map((p) => {
        const brandName = SEED_BRANDS.find((b) => b.id === p.brandId)?.name ?? '';
        const id = taken.has(p.id) ? ++nextId : p.id;
        taken.add(id);
        return { ...p, id, brandId: this.catalog.brandIdByName(brandName) ?? p.brandId };
      });
      if (added.length) this._products.set([...list, ...added]);
    }
    persist('products', this._products);
  }

  getById(id: number): Product | undefined {
    return this._products().find((p) => p.id === id);
  }

  create(input: ProductInput): Product {
    const id = Math.max(0, ...this._products().map((p) => p.id)) + 1;
    const product = summarize({ ...input, id, rating: 0, reviews: 0, createdAt: new Date().toISOString() });
    this._products.update((list) => [product, ...list]);
    return product;
  }

  update(id: number, input: ProductInput): void {
    const previous = this.getById(id);
    this._products.update((list) => list.map((p) => (p.id === id ? summarize({ ...p, ...input }) : p)));
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
  cover(p: Pick<Product, 'images'> | undefined): string | null {
    return this.imageStore.resolve(p?.images[0]);
  }

  variant(p: Product | undefined, variantId: string | undefined): Variant | undefined {
    if (!p) return undefined;
    return p.variants.find((v) => v.id === variantId) ?? (variantId ? undefined : defaultVariant(p));
  }

  /** Change the stock of one size (the default size when `variantId` is unknown, e.g. very old orders). */
  adjustStock(id: number, delta: number, variantId?: string): void {
    this._products.update((list) =>
      list.map((p) => {
        if (p.id !== id) return p;
        const target = p.variants.find((v) => v.id === variantId) ?? defaultVariant(p);
        return summarize({ ...p, variants: p.variants.map((v) => (v === target ? { ...v, stock: Math.max(0, v.stock + delta) } : v)) });
      }),
    );
  }
}
