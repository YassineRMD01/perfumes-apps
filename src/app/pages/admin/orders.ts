import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
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
import { Order, ORDER_STATUSES, OrderStatus, STATUS_SEVERITY, severityOf } from '../../core/models';
import { OrderService } from '../../core/order.service';
import { Bottle } from '../../shared/bottle';
import { Icons } from '../../shared/icons';

@Component({
  selector: 'app-admin-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, DatePipe, FormsModule, FaIconComponent, ButtonModule, DialogModule, IconFieldModule, InputIconModule, InputTextModule,
    SelectModule, SelectButtonModule, TableModule, TagModule, Bottle,
  ],
  template: `
    <div class="mb-6">
      <h2 class="text-3xl font-bold">Orders</h2>
      <p class="text-sm text-stone-500">Manage and fulfil customer orders</p>
    </div>

    <div class="card overflow-hidden">
      <p-table [value]="filtered()" dataKey="id" [paginator]="true" [rows]="10" [tableStyle]="{ 'min-width': '56rem' }" [rowHover]="true"
               sortField="createdAt" [sortOrder]="-1">
        <ng-template #caption>
          <div class="flex flex-wrap items-center gap-3">
            <p-iconfield>
              <p-inputicon><fa-icon [icon]="i.search" class="text-stone-400" /></p-inputicon>
              <input pInputText placeholder="Order # or customer" [(ngModel)]="search" />
            </p-iconfield>
            <p-selectbutton [options]="statusFilterOptions" [(ngModel)]="statusFilter" [allowEmpty]="false" size="small" />
          </div>
        </ng-template>
        <ng-template #header>
          <tr>
            <th pSortableColumn="id">Order <p-sort-icon field="id" /></th>
            <th pSortableColumn="customerName">Customer <p-sort-icon field="customerName" /></th>
            <th pSortableColumn="createdAt">Date <p-sort-icon field="createdAt" /></th>
            <th>Items</th>
            <th pSortableColumn="total">Total <p-sort-icon field="total" /></th>
            <th>Payment</th>
            <th class="w-48">Status</th>
            <th class="w-16"></th>
          </tr>
        </ng-template>
        <ng-template #body let-o>
          <tr>
            <td class="font-medium">{{ o.id }}</td>
            <td><div>{{ o.customerName }}</div><div class="text-xs text-stone-500">{{ o.email }}</div></td>
            <td>{{ o.createdAt | date: 'MMM d, y, HH:mm' }}</td>
            <td>{{ itemCount(o) }}</td>
            <td class="font-semibold">{{ o.total | currency }}</td>
            <td class="text-sm">{{ o.payment }}</td>
            <td>
              <p-select [options]="statuses" [ngModel]="o.status" (ngModelChange)="setStatus(o, $event)" appendTo="body" size="small" class="w-full">
                <ng-template #selectedItem let-s><p-tag [value]="s" [severity]="sevOf(s)" /></ng-template>
                <ng-template #item let-s><p-tag [value]="s" [severity]="sevOf(s)" /></ng-template>
              </p-select>
            </td>
            <td><p-button [text]="true" [rounded]="true" severity="secondary" (onClick)="selected.set(o)"><fa-icon [icon]="i.eye" /></p-button></td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr><td colspan="8" class="py-10 text-center text-stone-500">No orders found.</td></tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [visible]="!!selected()" (visibleChange)="!$event && selected.set(null)" [modal]="true"
              [header]="'Order ' + (selected()?.id ?? '')" [style]="{ width: '40rem' }" [breakpoints]="{ '720px': '95vw' }" [draggable]="false">
      @if (selected(); as o) {
        <div class="mb-4 flex flex-wrap items-center gap-3 text-sm text-stone-500">
          <span>{{ o.createdAt | date: 'medium' }}</span>
          <p-tag [value]="o.status" [severity]="sev[o.status]" />
          <span>{{ o.payment }}</span>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-xl bg-stone-50 p-4 text-sm">
            <div class="mb-1 font-semibold">Customer</div>
            <div>{{ o.customerName }}</div>
            <div class="text-stone-500">{{ o.email }}</div>
            <div class="text-stone-500">{{ o.shippingInfo.phone }}</div>
          </div>
          <div class="rounded-xl bg-stone-50 p-4 text-sm">
            <div class="mb-1 font-semibold">Shipping address</div>
            <div>{{ o.shippingInfo.fullName }}</div>
            <div class="text-stone-500">{{ o.shippingInfo.address }}, {{ o.shippingInfo.zip }} {{ o.shippingInfo.city }}, {{ o.shippingInfo.country }}</div>
          </div>
        </div>
        <ul class="mt-4 divide-y divide-stone-100">
          @for (it of o.items; track it.productId) {
            <li class="flex items-center gap-3 py-3">
              <div class="flex h-12 w-10 items-center justify-center rounded bg-stone-100 p-1"><app-bottle class="h-full" [color]="it.color" [name]="it.name" /></div>
              <div class="flex-1 text-sm"><div class="font-medium">{{ it.name }}</div><div class="text-xs text-stone-500">{{ it.brand }} · {{ it.qty }} × {{ it.price | currency }}</div></div>
              <div class="text-sm font-semibold">{{ it.qty * it.price | currency }}</div>
            </li>
          }
        </ul>
        <dl class="mt-2 space-y-1 border-t border-stone-200 pt-3 text-sm">
          <div class="flex justify-between"><dt class="text-stone-500">Subtotal</dt><dd>{{ o.subtotal | currency }}</dd></div>
          <div class="flex justify-between"><dt class="text-stone-500">Shipping</dt><dd>{{ o.shipping ? (o.shipping | currency) : 'Free' }}</dd></div>
          <div class="flex justify-between text-base font-bold"><dt>Total</dt><dd>{{ o.total | currency }}</dd></div>
        </dl>
      }
    </p-dialog>
  `,
})
export class AdminOrders {
  private readonly orders = inject(OrderService);
  private readonly toast = inject(MessageService);
  protected readonly i = Icons;
  protected readonly sev = STATUS_SEVERITY;
  protected readonly sevOf = severityOf;
  protected readonly statuses = ORDER_STATUSES;
  protected readonly statusFilterOptions = ['All', ...ORDER_STATUSES];

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

  itemCount(o: Order): number {
    return o.items.reduce((s, i) => s + i.qty, 0);
  }

  setStatus(o: Order, status: OrderStatus): void {
    this.orders.updateStatus(o.id, status);
    this.toast.add({ severity: 'success', summary: 'Status updated', detail: `${o.id} → ${status}`, life: 2000 });
  }
}
