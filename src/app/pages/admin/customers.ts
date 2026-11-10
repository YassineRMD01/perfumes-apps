import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AvatarModule } from 'primeng/avatar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../core/auth.service';
import { I18N_PIPES } from '../../core/i18n/pipes';
import { OrderService } from '../../core/order.service';
import { Icons } from '../../shared/icons';

@Component({
  selector: 'app-admin-customers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FaIconComponent, AvatarModule, IconFieldModule, InputIconModule, InputTextModule, TableModule, TagModule, ...I18N_PIPES],
  template: `
    <div class="mb-6">
      <h2 class="text-3xl font-bold">{{ 'ac.title' | t }}</h2>
      <p class="text-sm text-stone-500">{{ 'ac.count' | t: { n: rows().length } }}</p>
    </div>
    <div class="card overflow-hidden">
      <p-table #dt [value]="rows()" [paginator]="true" [rows]="10" [globalFilterFields]="['name', 'email']"
               [tableStyle]="{ 'min-width': '48rem' }" sortField="spent" [sortOrder]="-1" [rowHover]="true">
        <ng-template #caption>
          <p-iconfield>
            <p-inputicon><fa-icon [icon]="i.search" class="text-stone-400" /></p-inputicon>
            <input pInputText [placeholder]="'ac.search' | t" (input)="filter(dt, $event)" />
          </p-iconfield>
        </ng-template>
        <ng-template #header>
          <tr>
            <th pSortableColumn="name">{{ 'ac.customer' | t }} <p-sortIcon field="name" /></th>
            <th>{{ 'ac.phone' | t }}</th>
            <th pSortableColumn="createdAt">{{ 'ac.joined' | t }} <p-sortIcon field="createdAt" /></th>
            <th pSortableColumn="orders">{{ 'ac.orders' | t }} <p-sortIcon field="orders" /></th>
            <th pSortableColumn="spent">{{ 'ac.spent' | t }} <p-sortIcon field="spent" /></th>
            <th>{{ 'ac.segment' | t }}</th>
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
            <td class="text-sm" dir="ltr">{{ c.phone || '—' }}</td>
            <td>{{ c.createdAt | ldate }}</td>
            <td>{{ c.orders }}</td>
            <td class="font-semibold">{{ c.spent | money }}</td>
            <td>
              <p-tag [value]="(c.spent >= 300 ? 'VIP' : c.orders ? 'Returning' : 'New') | tv: 'seg'"
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
