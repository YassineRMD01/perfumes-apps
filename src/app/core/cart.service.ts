import { computed, inject, Injectable, signal } from '@angular/core';
import { CouponService } from './coupon.service';
import { CartItem, Product, Variant } from './models';
import { defaultVariant, ProductService } from './product.service';
import { SettingsService } from './settings.service';
import { load, persist } from './storage';

export interface CartLine {
  /** productId + variantId */
  key: string;
  product: Product;
  variant: Variant;
  qty: number;
  lineTotal: number;
}

const keyOf = (productId: number, variantId: string) => `${productId}:${variantId}`;

/** Flat shipping fee in USD (free above the threshold set in the store settings). */
export const SHIPPING_FEE = 9.9;

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly products = inject(ProductService);
  private readonly settings = inject(SettingsService);
  readonly freeShippingThreshold = computed(() => this.settings.settings().freeShippingThreshold);
  private readonly coupons = inject(CouponService);
  private readonly _items = signal<CartItem[]>(
    // carts saved before sizes existed: use the product's default size
    load<CartItem[]>('cart', []).map((i) => {
      const p = this.products.getById(i.productId);
      return i.variantId || !p ? i : { ...i, variantId: defaultVariant(p).id };
    }),
  );
  private readonly _couponCode = signal<string | null>(load('coupon', null));

  readonly lines = computed<CartLine[]>(() =>
    this._items()
      .map((i) => {
        const product = this.products.getById(i.productId);
        const variant = product?.variants.find((v) => v.id === i.variantId);
        return product && variant
          ? { key: keyOf(product.id, variant.id), product, variant, qty: i.qty, lineTotal: variant.price * i.qty }
          : null;
      })
      .filter((l): l is CartLine => l !== null),
  );
  readonly count = computed(() => this.lines().reduce((s, l) => s + l.qty, 0));
  readonly subtotal = computed(() => this.lines().reduce((s, l) => s + l.lineTotal, 0));
  /** Applied coupon, re-validated whenever the cart changes (e.g. falls under the minimum). */
  readonly coupon = computed(() => {
    const code = this._couponCode();
    if (!code) return null;
    const check = this.coupons.check(code, this.subtotal());
    return check.ok ? check.coupon : null;
  });
  readonly couponCode = this._couponCode.asReadonly();
  readonly discount = computed(() => {
    const c = this.coupon();
    return c ? this.coupons.discountFor(c, this.subtotal()) : 0;
  });
  /** Free shipping is based on the subtotal before discount. */
  readonly shipping = computed(() =>
    this.subtotal() === 0 || this.subtotal() >= this.freeShippingThreshold() ? 0 : SHIPPING_FEE,
  );
  readonly total = computed(() => +Math.max(0, this.subtotal() - this.discount() + this.shipping()).toFixed(2));
  readonly isEmpty = computed(() => this.lines().length === 0);

  constructor() {
    persist('cart', this._items);
    persist('coupon', this._couponCode);
  }

  /** Quantity in the cart for one size (or for all sizes of the product when variantId is omitted). */
  qtyOf(productId: number, variantId?: string): number {
    return this._items()
      .filter((i) => i.productId === productId && (!variantId || i.variantId === variantId))
      .reduce((s, i) => s + i.qty, 0);
  }

  /** Adds a size (the default size when omitted). Returns the quantity actually added (limited by that size's stock). */
  add(productId: number, variantId?: string, qty = 1): number {
    const product = this.products.getById(productId);
    if (!product) return 0;
    const variant = product.variants.find((v) => v.id === variantId) ?? defaultVariant(product);
    const current = this.qtyOf(productId, variant.id);
    const next = Math.min(variant.stock, current + qty);
    if (next <= current) return 0;
    this.setQty(productId, variant.id, next);
    return next - current;
  }

  setQty(productId: number, variantId: string, qty: number): void {
    if (qty <= 0) return this.remove(productId, variantId);
    const same = (i: CartItem) => i.productId === productId && i.variantId === variantId;
    this._items.update((items) =>
      items.some(same) ? items.map((i) => (same(i) ? { ...i, qty } : i)) : [...items, { productId, variantId, qty }],
    );
  }

  remove(productId: number, variantId: string): void {
    this._items.update((items) => items.filter((i) => !(i.productId === productId && i.variantId === variantId)));
  }

  applyCoupon(code: string): void {
    this._couponCode.set(code);
  }

  removeCoupon(): void {
    this._couponCode.set(null);
  }

  clear(): void {
    this._items.set([]);
    this._couponCode.set(null);
  }
}
