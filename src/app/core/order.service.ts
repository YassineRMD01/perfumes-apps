import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { CatalogService } from './catalog.service';
import { CouponService } from './coupon.service';
import { Order, OrderStatus, PaymentMethod, ShippingInfo } from './models';
import { ProductService } from './product.service';
import { SEED_ORDERS } from './seed';
import { load, persist } from './storage';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly products = inject(ProductService);
  private readonly catalog = inject(CatalogService);
  private readonly coupons = inject(CouponService);
  private readonly _orders = signal<Order[]>(load('orders', SEED_ORDERS));

  readonly orders = computed(() =>
    [...this._orders()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
  readonly myOrders = computed(() => {
    const user = this.auth.currentUser();
    return user ? this.orders().filter((o) => o.userId === user.id) : [];
  });
  readonly revenue = computed(() =>
    this._orders().filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0),
  );

  constructor() {
    persist('orders', this._orders);
  }

  place(shippingInfo: ShippingInfo, payment: PaymentMethod): Order {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');
    if (this.cart.isEmpty()) throw new Error('Cart is empty');

    const items = this.cart.lines().map((l) => ({
      productId: l.product.id,
      name: l.product.name,
      brand: this.catalog.brandName(l.product.brandId),
      color: l.product.color,
      variantId: l.variant.id,
      size: l.variant.size,
      unit: l.variant.unit,
      decant: l.variant.type === 'decant',
      price: l.variant.price,
      qty: l.qty,
    }));
    const nextNum = Math.max(1000, ...this._orders().map((o) => Number(o.id.split('-')[1]) || 0)) + 1;
    const order: Order = {
      id: `ES-${nextNum}`,
      userId: user.id,
      customerName: user.name,
      email: user.email,
      items,
      subtotal: this.cart.subtotal(),
      discount: this.cart.discount(),
      couponCode: this.cart.coupon()?.code,
      shipping: this.cart.shipping(),
      total: this.cart.total(),
      status: 'Pending',
      payment,
      shippingInfo,
      createdAt: new Date().toISOString(),
    };

    items.forEach((i) => this.products.adjustStock(i.productId, -i.qty, i.variantId));
    if (order.couponCode) this.coupons.recordUse(order.couponCode);
    this._orders.update((list) => [order, ...list]);
    this.cart.clear();
    return order;
  }

  updateStatus(id: string, status: OrderStatus): void {
    const order = this._orders().find((o) => o.id === id);
    if (!order || order.status === status) return;
    // Restock when cancelling, take stock again when reviving a cancelled order
    if (status === 'Cancelled') order.items.forEach((i) => this.products.adjustStock(i.productId, i.qty, i.variantId));
    if (order.status === 'Cancelled') order.items.forEach((i) => this.products.adjustStock(i.productId, -i.qty, i.variantId));
    this._orders.update((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
  }
}
