import { Injectable, signal } from '@angular/core';
import { Coupon } from './models';
import { SEED_COUPONS } from './seed';
import { load, persist } from './storage';

export type CouponCheck =
  | { ok: true; coupon: Coupon }
  | { ok: false; reason: 'unknown' | 'inactive' | 'expired' | 'minimum'; minSubtotal?: number };

export const normalizeCode = (code: string) => code.trim().toUpperCase().replace(/\s+/g, '');

/** Discount codes managed by the admin and redeemed by customers in the cart. */
@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly _coupons = signal<Coupon[]>(load('coupons', SEED_COUPONS));
  readonly coupons = this._coupons.asReadonly();

  constructor() {
    persist('coupons', this._coupons);
  }

  find(code: string): Coupon | undefined {
    const c = normalizeCode(code);
    return this._coupons().find((x) => x.code === c);
  }

  isExpired(c: Coupon): boolean {
    return !!c.expiresAt && c.expiresAt < new Date().toISOString().slice(0, 10);
  }

  check(code: string, subtotal: number): CouponCheck {
    const coupon = this.find(code);
    if (!coupon) return { ok: false, reason: 'unknown' };
    if (!coupon.active) return { ok: false, reason: 'inactive' };
    if (this.isExpired(coupon)) return { ok: false, reason: 'expired' };
    if (subtotal < coupon.minSubtotal) return { ok: false, reason: 'minimum', minSubtotal: coupon.minSubtotal };
    return { ok: true, coupon };
  }

  /** Discount in USD for a subtotal (never more than the subtotal). */
  discountFor(coupon: Coupon, subtotal: number): number {
    const raw = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value;
    return Math.round(Math.min(subtotal, raw) * 100) / 100;
  }

  save(coupon: Omit<Coupon, 'uses' | 'createdAt'>, originalCode?: string): void {
    const code = normalizeCode(coupon.code);
    const existing = this._coupons().find((c) => c.code === (originalCode ?? code));
    if (existing) {
      this._coupons.update((list) => list.map((c) => (c === existing ? { ...existing, ...coupon, code } : c)));
    } else {
      this._coupons.update((list) => [{ ...coupon, code, uses: 0, createdAt: new Date().toISOString() }, ...list]);
    }
  }

  setActive(code: string, active: boolean): void {
    this._coupons.update((list) => list.map((c) => (c.code === code ? { ...c, active } : c)));
  }

  delete(code: string): void {
    this._coupons.update((list) => list.filter((c) => c.code !== code));
  }

  recordUse(code: string): void {
    this._coupons.update((list) => list.map((c) => (c.code === code ? { ...c, uses: c.uses + 1 } : c)));
  }
}
