import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AvatarModule } from 'primeng/avatar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../core/auth.service';
import { OrderService } from '../../core/order.service';
import { Icons } from '../../shared/icons';

@Component({
  selector: 'app-admin-customers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, FaIconComponent, AvatarModule, IconFieldModule, InputIconModule, InputTextModule, TableModule, TagModule],
  template: `
    <div class="mb-6">
      <h2 class="text-3xl font-bold">Customers</h2>
      <p class="text-sm text-stone-500">{{ rows().length }} registered clients</p>
    </div>
    <div class="card overflow-hidden">
      <p-table #dt [value]="rows()" [paginator]="true" [rows]="10" [globalFilterFields]="['name', 'email']"
               [tableStyle]="{ 'min-width': '48rem' }" sortField="spent" [sortOrder]="-1" [rowHover]="true">
        <ng-template #caption>
          <p-iconfield>
            <p-inputicon><fa-icon [icon]="i.search" class="text-stone-400" /></p-inputicon>
            <input pInputText placeholder="Search customers…" (input)="filter(dt, $event)" />
          </p-iconfield>
        </ng-template>
        <ng-template #header>
          <tr>
            <th pSortableColumn="name">Customer <p-sortIcon field="name" /></th>
            <th>Phone</th>
            <th pSortableColumn="createdAt">Joined <p-sortIcon field="createdAt" /></th>
            <th pSortableColumn="orders">Orders <p-sortIcon field="orders" /></th>
            <th pSortableColumn="spent">Total spent <p-sortIcon field="spent" /></th>
            <th>Segment</th>
          </tr>
        </ng-template>
        <ng-template #body let-c>
          <tr>
            <td>
              <div class="flex items-center gap-3">
                <p-avatar [label]="c.initials" shape="circle" class="!bg-amber-100 !text-amber-800" />
                <div><div class="font-medium">{{ c.name }}</div><div class="text-xs text-stone-500">{{ c.email }}</div></div>
              </div>
            </td>
            <td class="text-sm">{{ c.phone || '—' }}</td>
            <td>{{ c.createdAt | date: 'mediumDate' }}</td>
            <td>{{ c.orders }}</td>
            <td class="font-semibold">{{ c.spent | currency }}</td>
            <td>
              <p-tag [value]="c.spent >= 300 ? 'VIP' : c.orders ? 'Returning' : 'New'"
                     [severity]="c.spent >= 300 ? 'warn' : c.orders ? 'info' : 'secondary'" />
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class AdminCustomers {
  private readonly auth = inject(AuthService);
  private readonly orders = inject(OrderService);
  protected readonly i = Icons;

  protected readonly rows = computed(() =>
    this.auth.customers().map((u) => {
      const mine = this.orders.orders().filter((o) => o.userId === u.id && o.status !== 'Cancelled');
      return {
        ...u,
        initials: u.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase(),
        orders: mine.length,
        spent: mine.reduce((s, o) => s + o.total, 0),
      };
    }),
  );

  filter(dt: Table, e: Event): void {
    dt.filterGlobal((e.target as HTMLInputElement).value, 'contains');
  }
}
