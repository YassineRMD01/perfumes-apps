import { computed, inject, Injectable, signal } from '@angular/core';
import { CouponService } from './coupon.service';
import { CartItem, Perfume } from './models';
import { ProductService } from './product.service';
import { SettingsService } from './settings.service';
import { load, persist } from './storage';

export interface CartLine {
  product: Perfume;
  qty: number;
  lineTotal: number;
}

/** Flat shipping fee in USD (free above the threshold set in the store settings). */
export const SHIPPING_FEE = 9.9;

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly products = inject(ProductService);
  private readonly settings = inject(SettingsService);
  readonly freeShippingThreshold = computed(() => this.settings.settings().freeShippingThreshold);
  private readonly coupons = inject(CouponService);
  private readonly _items = signal<CartItem[]>(load('cart', []));
  private readonly _couponCode = signal<string | null>(load('coupon', null));

  readonly lines = computed<CartLine[]>(() =>
    this._items()
      .map((i) => {
        const product = this.products.getById(i.productId);
        return product ? { product, qty: i.qty, lineTotal: product.price * i.qty } : null;
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

  qtyOf(productId: number): number {
    return this._items().find((i) => i.productId === productId)?.qty ?? 0;
  }

  /** Returns the quantity actually added (limited by stock). */
  add(productId: number, qty = 1): number {
    const stock = this.products.getById(productId)?.stock ?? 0;
    const current = this.qtyOf(productId);
    const next = Math.min(stock, current + qty);
    if (next <= current) return 0;
    this.setQty(productId, next);
    return next - current;
  }

  setQty(productId: number, qty: number): void {
    if (qty <= 0) return this.remove(productId);
    this._items.update((items) =>
      items.some((i) => i.productId === productId)
        ? items.map((i) => (i.productId === productId ? { ...i, qty } : i))
        : [...items, { productId, qty }],
    );
  }

  remove(productId: number): void {
    this._items.update((items) => items.filter((i) => i.productId !== productId));
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
