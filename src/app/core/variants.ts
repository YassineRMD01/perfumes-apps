import { Product, Variant } from './models';

/** Sort full sizes first (small → large), then decants (small → large). */
export function sortVariants(variants: Variant[]): Variant[] {
  return [...variants].sort((a, b) => (a.type === b.type ? a.size - b.size : a.type === 'bottle' ? -1 : 1));
}

/** Default size: the largest full size in stock, else any size in stock, else the largest full size. */
export function defaultVariant(p: Pick<Product, 'variants'>): Variant {
  const bottles = p.variants.filter((v) => v.type === 'bottle');
  const inStock = (list: Variant[]) => list.filter((v) => v.stock > 0);
  return inStock(bottles).at(-1) ?? inStock(p.variants)[0] ?? bottles.at(-1) ?? p.variants[0];
}

/** Recompute the summary fields from the variants. */
export function summarize<T extends Omit<Product, 'price' | 'oldPrice' | 'stock' | 'volumeMl' | 'unit'>>(p: T): T & Product {
  const variants = sortVariants(p.variants);
  const cheapest = variants.reduce((a, b) => (b.price < a.price ? b : a), variants[0]);
  const def = defaultVariant({ variants });
  return {
    ...p,
    variants,
    price: cheapest?.price ?? 0,
    oldPrice: cheapest?.oldPrice ?? null,
    stock: variants.reduce((s, v) => s + v.stock, 0),
    volumeMl: def?.size ?? 0,
    unit: def?.unit ?? 'ml',
  } as T & Product;
}
