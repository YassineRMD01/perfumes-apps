import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../../core/auth.service';
import { I18N_PIPES } from '../../../core/i18n/pipes';
import { severityOf } from '../../../core/models';
import { OrderService } from '../../../core/order.service';
import { ReviewService } from '../../../core/review.service';
import { Icons } from '../../../shared/icons';

@Component({
  selector: 'app-admin-customers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FaIconComponent, AvatarModule, ButtonModule, DialogModule, TooltipModule, IconFieldModule, InputIconModule, InputTextModule, TableModule, TagModule, ...I18N_PIPES],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class AdminCustomers {
  private readonly auth = inject(AuthService);
  private readonly orders = inject(OrderService);
  private readonly reviews = inject(ReviewService);
  protected readonly i = Icons;
  protected readonly sevOf = severityOf;
  protected readonly selectedId = signal<number | null>(null);
  protected readonly selected = computed(() => {
    const row = this.rows().find((r) => r.id === this.selectedId());
    return row ? { ...row, reviews: this.reviews.reviews().filter((r) => r.userId === row.id).length } : null;
  });
  protected readonly history = computed(() => this.orders.orders().filter((o) => o.userId === this.selectedId()));

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
