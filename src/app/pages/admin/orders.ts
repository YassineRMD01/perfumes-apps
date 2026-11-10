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
import { I18nService } from '../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../core/i18n/pipes';
import { Order, ORDER_STATUSES, OrderStatus, severityOf, STATUS_SEVERITY } from '../../core/models';
import { OrderService } from '../../core/order.service';
import { ProductService } from '../../core/product.service';
import { Bottle } from '../../shared/bottle';
import { Icons } from '../../shared/icons';

@Component({
  selector: 'app-admin-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, FaIconComponent, ButtonModule, DialogModule, IconFieldModule, InputIconModule, InputTextModule,
    SelectModule, SelectButtonModule, TableModule, TagModule, TooltipModule, Bottle, ...I18N_PIPES,
  ],
  template: `
    <div class="mb-6">
      <h2 class="text-3xl font-bold">{{ 'ao.title' | t }}</h2>
      <p class="text-sm text-stone-500">{{ 'ao.subtitle' | t }}</p>
    </div>

    <div class="card overflow-hidden">
      <p-table [value]="filtered()" dataKey="id" [paginator]="true" [rows]="10" [tableStyle]="{ 'min-width': '60rem' }" [rowHover]="true"
               sortField="createdAt" [sortOrder]="-1">
        <ng-template #caption>
          <div class="flex flex-wrap items-center gap-3">
            <p-iconfield>
              <p-inputicon><fa-icon [icon]="i.search" class="text-stone-400" /></p-inputicon>
              <input pInputText [placeholder]="'ao.search' | t" [(ngModel)]="search" />
            </p-iconfield>
            <p-selectbutton [options]="statusFilterOptions()" optionLabel="label" optionValue="value" [(ngModel)]="statusFilter" [allowEmpty]="false" size="small" />
          </div>
        </ng-template>
        <ng-template #header>
          <tr>
            <th pSortableColumn="id">{{ 'dash.order' | t }} <p-sortIcon field="id" /></th>
            <th pSortableColumn="customerName">{{ 'dash.customer' | t }} <p-sortIcon field="customerName" /></th>
            <th pSortableColumn="createdAt">{{ 'dash.date' | t }} <p-sortIcon field="createdAt" /></th>
            <th>{{ 'ao.items' | t }}</th>
            <th pSortableColumn="total">{{ 'dash.total' | t }} <p-sortIcon field="total" /></th>
            <th>{{ 'ao.payment' | t }}</th>
            <th class="w-52">{{ 'dash.status' | t }}</th>
            <th class="w-16"></th>
          </tr>
        </ng-template>
        <ng-template #body let-o>
          <tr>
            <td class="font-medium" dir="ltr">{{ o.id }}</td>
            <td><div>{{ o.customerName }}</div><div class="text-xs text-stone-500">{{ o.email }}</div></td>
            <td>{{ o.createdAt | ldate: 'datetime' }}</td>
            <td>{{ itemCount(o) }}</td>
            <td class="font-semibold">{{ o.total | money }}</td>
            <td class="text-sm">{{ o.payment | tv: 'payment' }}</td>
            <td>
              <p-select [options]="statuses" [ngModel]="o.status" (ngModelChange)="setStatus(o, $event)" appendTo="body" size="small" class="w-full">
                <ng-template #selectedItem let-s><p-tag [value]="s | tv: 'status'" [severity]="sevOf(s)" /></ng-template>
                <ng-template #item let-s><p-tag [value]="s | tv: 'status'" [severity]="sevOf(s)" /></ng-template>
              </p-select>
            </td>
            <td>
              <p-button [text]="true" [rounded]="true" severity="secondary" (onClick)="selected.set(o)" [pTooltip]="'ao.view' | t" [ariaLabel]="'ao.view' | t">
                <fa-icon [icon]="i.eye" />
              </p-button>
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr><td colspan="8" class="py-10 text-center text-stone-500">{{ 'ao.empty' | t }}</td></tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [visible]="!!selected()" (visibleChange)="!$event && selected.set(null)" [modal]="true"
              [header]="'ao.orderTitle' | t: { id: selected()?.id ?? '' }" [style]="{ width: '40rem' }" [breakpoints]="{ '720px': '95vw' }" [draggable]="false">
      @if (selected(); as o) {
        <div class="mb-4 flex flex-wrap items-center gap-3 text-sm text-stone-500">
          <span>{{ o.createdAt | ldate: 'datetime' }}</span>
          <p-tag [value]="o.status | tv: 'status'" [severity]="sev[o.status]" />
          <span>{{ o.payment | tv: 'payment' }}</span>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-xl bg-stone-50 p-4 text-sm">
            <div class="mb-1 font-semibold">{{ 'ao.customer' | t }}</div>
            <div>{{ o.customerName }}</div>
            <div class="text-stone-500">{{ o.email }}</div>
            <div class="text-stone-500" dir="ltr">{{ o.shippingInfo.phone }}</div>
          </div>
          <div class="rounded-xl bg-stone-50 p-4 text-sm">
            <div class="mb-1 font-semibold">{{ 'ao.shippingAddress' | t }}</div>
            <div>{{ o.shippingInfo.fullName }}</div>
            <div class="text-stone-500">{{ o.shippingInfo.address }}, {{ o.shippingInfo.zip }} {{ o.shippingInfo.city }}, {{ o.shippingInfo.country }}</div>
          </div>
        </div>
        <ul class="mt-4 divide-y divide-stone-100">
          @for (it of o.items; track it.productId) {
            <li class="flex items-center gap-3 py-3">
              <div class="flex h-12 w-10 items-center justify-center overflow-hidden rounded bg-stone-100">
                <app-bottle class="h-full w-full" [color]="it.color" [name]="it.name" [image]="photo(it.productId)" fit="cover" />
              </div>
              <div class="flex-1 text-sm"><div class="font-medium">{{ it.name }}</div><div class="text-xs text-stone-500">{{ it.brand }} · {{ it.qty }} × {{ it.price | money }}</div></div>
              <div class="text-sm font-semibold">{{ it.qty * it.price | money }}</div>
            </li>
          }
        </ul>
        <dl class="mt-2 space-y-1 border-t border-stone-200 pt-3 text-sm">
          <div class="flex justify-between"><dt class="text-stone-500">{{ 'common.subtotal' | t }}</dt><dd>{{ o.subtotal | money }}</dd></div>
          <div class="flex justify-between"><dt class="text-stone-500">{{ 'common.shipping' | t }}</dt><dd>{{ o.shipping ? (o.shipping | money) : ('common.free' | t) }}</dd></div>
          <div class="flex justify-between text-base font-bold"><dt>{{ 'common.total' | t }}</dt><dd>{{ o.total | money }}</dd></div>
        </dl>
      }
    </p-dialog>
  `,
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
