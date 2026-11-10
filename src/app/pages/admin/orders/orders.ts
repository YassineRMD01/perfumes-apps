import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { downloadCsv } from '../../../core/csv';
import { I18nService } from '../../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../../core/i18n/pipes';
import { Order, ORDER_STATUSES, OrderStatus, severityOf, STATUS_SEVERITY } from '../../../core/models';
import { OrderService } from '../../../core/order.service';
import { ProductService } from '../../../core/product.service';
import { Bottle } from '../../../shared/bottle/bottle';
import { Icons } from '../../../shared/icons';

@Component({
  selector: 'app-admin-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, FaIconComponent, ButtonModule, DialogModule, IconFieldModule, InputIconModule, InputTextModule,
    SelectModule, SelectButtonModule, TableModule, TagModule, TooltipModule, Bottle, ...I18N_PIPES,
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class AdminOrders {
  private readonly orders = inject(OrderService);
  private readonly products = inject(ProductService);
  private readonly toast = inject(MessageService);
  private readonly i18n = inject(I18nService);
  protected readonly i = Icons;
  protected readonly sev = STATUS_SEVERITY;
  protected readonly sevOf = severityOf;
  protected readonly statuses = ORDER_STATUSES;
  protected readonly statusFilterOptions = computed(() => [
    { value: 'All', label: this.i18n.t('shop.all') },
    ...ORDER_STATUSES.map((s) => ({ value: s, label: this.i18n.tv('status', s) })),
  ]);

  protected readonly search = signal('');
  protected readonly statusFilter = signal<string>('All');
  protected readonly selected = signal<Order | null>(null);

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    return this.orders.orders().filter(
      (o) =>
        (status === 'All' || o.status === status) &&
        (!term || o.id.toLowerCase().includes(term) || o.customerName.toLowerCase().includes(term) || o.email.toLowerCase().includes(term)),
    );
  });

  protected photo(productId: number): string | undefined {
    return this.products.getById(productId)?.images[0];
  }

  /** Exports the orders currently shown (search and status filter applied). Amounts in USD. */
  exportCsv(): void {
    downloadCsv(
      `orders-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Order', 'Date', 'Customer', 'Email', 'Status', 'Payment', 'Items', 'Subtotal (USD)', 'Discount (USD)', 'Coupon', 'Shipping (USD)',
       'Total (USD)', 'Address', 'City', 'Country'],
      this.filtered().map((o) => [
        o.id, o.createdAt.slice(0, 16).replace('T', ' '), o.customerName, o.email, o.status, o.payment,
        o.items.map((i) => `${i.qty}× ${i.name}`).join(' | '), o.subtotal, o.discount ?? 0, o.couponCode ?? '', o.shipping, o.total,
        o.shippingInfo.address, o.shippingInfo.city, o.shippingInfo.country,
      ]),
    );
  }

  itemCount(o: Order): number {
    return o.items.reduce((s, i) => s + i.qty, 0);
  }

  setStatus(o: Order, status: OrderStatus): void {
    this.orders.updateStatus(o.id, status);
    this.toast.add({
      severity: 'success',
      summary: this.i18n.t('toast.statusUpdated'),
      detail: `${o.id} → ${this.i18n.tv('status', status)}`,
      life: 2000,
    });
  }
}
