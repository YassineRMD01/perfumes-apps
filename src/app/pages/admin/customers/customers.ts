import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AvatarModule } from 'primeng/avatar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../../core/auth.service';
import { I18N_PIPES } from '../../../core/i18n/pipes';
import { OrderService } from '../../../core/order.service';
import { Icons } from '../../../shared/icons';

@Component({
  selector: 'app-admin-customers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FaIconComponent, AvatarModule, IconFieldModule, InputIconModule, InputTextModule, TableModule, TagModule, ...I18N_PIPES],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
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
