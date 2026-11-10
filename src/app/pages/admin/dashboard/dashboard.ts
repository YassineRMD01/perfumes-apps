import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../../core/auth.service';
import { CurrencyService } from '../../../core/currency.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../../core/i18n/pipes';
import { ORDER_STATUSES, severityOf, STATUS_SEVERITY } from '../../../core/models';
import { OrderService } from '../../../core/order.service';
import { ProductService } from '../../../core/product.service';
import { Bottle } from '../../../shared/bottle/bottle';
import { Icons } from '../../../shared/icons';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FaIconComponent, TableModule, TagModule, Bottle, ...I18N_PIPES],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected readonly products = inject(ProductService);
  private readonly orders = inject(OrderService);
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(I18nService);
  private readonly currency = inject(CurrencyService);
  protected readonly i = Icons;
  protected readonly sev = STATUS_SEVERITY;
  protected readonly sevOf = severityOf;

  private readonly active = computed(() => this.orders.orders().filter((o) => o.status !== 'Cancelled'));

  protected readonly kpis = computed(() => {
    const t = this.i18n;
    const active = this.active();
    const revenue = this.orders.revenue();
    return [
      { label: t.t('dash.revenue'), value: this.currency.format(revenue, true), hint: t.t('dash.revenueHint'), icon: Icons.chart, tone: 'tone-brand' },
      { label: t.t('dash.orders'), value: String(this.orders.orders().length), hint: t.t('dash.pending', { n: this.orders.orders().filter((o) => o.status === 'Pending').length }), icon: Icons.receipt, tone: 'tone-sky' },
      { label: t.t('dash.aov'), value: this.currency.format(active.length ? revenue / active.length : 0), hint: t.t('dash.paid', { n: active.length }), icon: Icons.bag, tone: 'tone-sage' },
      { label: t.t('dash.customers'), value: String(this.auth.customers().length), hint: t.t('dash.catalog', { n: this.products.products().length }), icon: Icons.users, tone: 'tone-lilac' },
    ];
  });

  protected readonly monthly = computed(() => {
    const locale = this.i18n.locale();
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, k) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - k), 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString(locale, { month: 'short' }), value: 0, pct: 0 };
    });
    for (const o of this.active()) {
      const d = new Date(o.createdAt);
      const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (m) m.value += o.total;
    }
    const max = Math.max(1, ...months.map((m) => m.value));
    months.forEach((m) => (m.pct = (m.value / max) * 85));
    return months;
  });
  protected readonly monthlyTotal = computed(() => this.monthly().reduce((s, m) => s + m.value, 0));

  protected readonly byStatus = computed(() => {
    const all = this.orders.orders();
    return ORDER_STATUSES.map((status) => {
      const count = all.filter((o) => o.status === status).length;
      return { status, count, pct: all.length ? (count / all.length) * 100 : 0 };
    });
  });

  protected readonly recent = computed(() => this.orders.orders().slice(0, 6));

  protected readonly topSellers = computed(() => {
    const map = new Map<number, { id: number; name: string; color: string; image?: string; qty: number; revenue: number }>();
    for (const o of this.active())
      for (const it of o.items) {
        const e = map.get(it.productId) ?? {
          id: it.productId, name: it.name, color: it.color, image: this.products.getById(it.productId)?.images[0], qty: 0, revenue: 0,
        };
        e.qty += it.qty;
        e.revenue += it.qty * it.price;
        map.set(it.productId, e);
      }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  });
}
