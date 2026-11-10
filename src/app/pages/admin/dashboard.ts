import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../core/auth.service';
import { ORDER_STATUSES, STATUS_SEVERITY, severityOf } from '../../core/models';
import { OrderService } from '../../core/order.service';
import { ProductService } from '../../core/product.service';
import { Bottle } from '../../shared/bottle';
import { Icons } from '../../shared/icons';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, RouterLink, FaIconComponent, TableModule, TagModule, Bottle],
  template: `
    <div class="mb-6">
      <h2 class="text-3xl font-bold">Dashboard</h2>
      <p class="text-sm text-stone-500">Store performance at a glance</p>
    </div>

    <!-- KPIs -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      @for (k of kpis(); track k.label) {
        <div class="card flex items-center gap-4 p-5">
          <span class="grid h-12 w-12 place-items-center rounded-xl text-xl {{ k.tone }}"><fa-icon [icon]="k.icon" /></span>
          <div>
            <div class="text-sm text-stone-500">{{ k.label }}</div>
            <div class="text-2xl font-bold">{{ k.value }}</div>
            <div class="text-xs text-stone-400">{{ k.hint }}</div>
          </div>
        </div>
      }
    </div>

    <div class="mt-6 grid gap-6 xl:grid-cols-3">
      <!-- Revenue chart -->
      <div class="card p-6 xl:col-span-2">
        <div class="mb-6 flex items-center justify-between">
          <h3 class="text-lg font-semibold">Revenue — last 6 months</h3>
          <span class="text-sm text-stone-500">{{ monthlyTotal() | currency }}</span>
        </div>
        <div class="flex h-56 items-end gap-3 sm:gap-6">
          @for (m of monthly(); track m.label) {
            <div class="group flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span class="text-xs font-medium text-stone-600 opacity-0 transition group-hover:opacity-100">{{ m.value | currency: 'USD' : 'symbol' : '1.0-0' }}</span>
              <div class="w-full max-w-14 rounded-t-lg bg-gradient-to-t from-amber-700 to-amber-400 transition-all group-hover:from-amber-800"
                   [style.height.%]="m.pct" [style.min-height.px]="m.value ? 4 : 0"></div>
              <span class="text-xs text-stone-500">{{ m.label }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Orders by status -->
      <div class="card p-6">
        <h3 class="mb-5 text-lg font-semibold">Orders by status</h3>
        <ul class="space-y-4">
          @for (s of byStatus(); track s.status) {
            <li>
              <div class="mb-1 flex justify-between text-sm">
                <p-tag [value]="s.status" [severity]="sev[s.status]" />
                <span class="font-medium">{{ s.count }}</span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-stone-100">
                <div class="h-full rounded-full bg-amber-500" [style.width.%]="s.pct"></div>
              </div>
            </li>
          }
        </ul>
      </div>
    </div>

    <div class="mt-6 grid gap-6 xl:grid-cols-3">
      <!-- Recent orders -->
      <div class="card overflow-hidden xl:col-span-2">
        <div class="flex items-center justify-between p-5">
          <h3 class="text-lg font-semibold">Recent orders</h3>
          <a routerLink="/admin/orders" class="text-sm text-amber-700 hover:underline">View all</a>
        </div>
        <p-table [value]="recent()" [tableStyle]="{ 'min-width': '36rem' }" size="small">
          <ng-template #header>
            <tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr>
          </ng-template>
          <ng-template #body let-o>
            <tr>
              <td class="font-medium">{{ o.id }}</td>
              <td>{{ o.customerName }}</td>
              <td>{{ o.createdAt | date: 'MMM d' }}</td>
              <td>{{ o.total | currency }}</td>
              <td><p-tag [value]="o.status" [severity]="sevOf(o.status)" /></td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Top sellers + low stock -->
      <div class="flex flex-col gap-6">
        <div class="card p-5">
          <h3 class="mb-4 text-lg font-semibold">Top sellers</h3>
          <ul class="space-y-3">
            @for (t of topSellers(); track t.id; let idx = $index) {
              <li class="flex items-center gap-3">
                <span class="w-4 text-sm font-bold text-stone-400">{{ idx + 1 }}</span>
                <div class="flex h-10 w-8 items-center justify-center"><app-bottle class="h-full" [color]="t.color" [name]="t.name" /></div>
                <div class="flex-1 text-sm"><div class="font-medium">{{ t.name }}</div><div class="text-xs text-stone-500">{{ t.qty }} sold</div></div>
                <span class="text-sm font-semibold">{{ t.revenue | currency: 'USD' : 'symbol' : '1.0-0' }}</span>
              </li>
            }
          </ul>
        </div>
        <div class="card p-5">
          <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold"><fa-icon [icon]="i.warning" class="text-amber-600" /> Low stock</h3>
          @if (products.lowStock().length) {
            <ul class="space-y-2">
              @for (p of products.lowStock(); track p.id) {
                <li class="flex items-center justify-between text-sm">
                  <span>{{ p.name }} <span class="text-stone-400">· {{ p.brand }}</span></span>
                  <p-tag [value]="p.stock ? p.stock + ' left' : 'Out'" [severity]="p.stock ? 'warn' : 'danger'" />
                </li>
              }
            </ul>
          } @else {
            <p class="text-sm text-stone-500">All products are well stocked.</p>
          }
        </div>
      </div>
    </div>
  `,
})
export class Dashboard {
  protected readonly products = inject(ProductService);
  private readonly orders = inject(OrderService);
  private readonly auth = inject(AuthService);
  private readonly currency = new CurrencyPipe('en-US');
  protected readonly i = Icons;
  protected readonly sev = STATUS_SEVERITY;
  protected readonly sevOf = severityOf;

  private readonly active = computed(() => this.orders.orders().filter((o) => o.status !== 'Cancelled'));

  protected readonly kpis = computed(() => {
    const active = this.active();
    const revenue = this.orders.revenue();
    return [
      { label: 'Revenue', value: this.currency.transform(revenue, 'USD', 'symbol', '1.0-0'), hint: 'Excluding cancelled', icon: Icons.chart, tone: 'bg-amber-100 text-amber-700' },
      { label: 'Orders', value: String(this.orders.orders().length), hint: `${this.orders.orders().filter((o) => o.status === 'Pending').length} pending`, icon: Icons.receipt, tone: 'bg-sky-100 text-sky-700' },
      { label: 'Avg. order value', value: this.currency.transform(active.length ? revenue / active.length : 0), hint: `${active.length} paid orders`, icon: Icons.bag, tone: 'bg-emerald-100 text-emerald-700' },
      { label: 'Customers', value: String(this.auth.customers().length), hint: `${this.products.products().length} products in catalog`, icon: Icons.users, tone: 'bg-violet-100 text-violet-700' },
    ];
  });

  protected readonly monthly = computed(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, k) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - k), 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en', { month: 'short' }), value: 0, pct: 0 };
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
    const map = new Map<number, { id: number; name: string; color: string; qty: number; revenue: number }>();
    for (const o of this.active())
      for (const it of o.items) {
        const e = map.get(it.productId) ?? { id: it.productId, name: it.name, color: it.color, qty: 0, revenue: 0 };
        e.qty += it.qty;
        e.revenue += it.qty * it.price;
        map.set(it.productId, e);
      }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  });
}
