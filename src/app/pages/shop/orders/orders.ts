import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { I18nService } from '../../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../../core/i18n/pipes';
import { Order, STATUS_SEVERITY, Packaging } from '../../../core/models';
import { OrderService } from '../../../core/order.service';
import { ProductService } from '../../../core/product.service';
import { Bottle } from '../../../shared/bottle/bottle';
import { Icons } from '../../../shared/icons';

@Component({
  selector: 'app-my-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FaIconComponent, AccordionModule, ButtonModule, MessageModule, TagModule, Bottle, ...I18N_PIPES],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class MyOrders {
  readonly placed = input<string>();
  protected readonly orders = inject(OrderService);
  private readonly products = inject(ProductService);
  private readonly confirm = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  private readonly i18n = inject(I18nService);
  protected readonly i = Icons;
  protected readonly sev = STATUS_SEVERITY;

  protected pack(productId: number): Packaging {
    return this.products.getById(productId)?.packaging ?? 'bottle';
  }

  protected photo(productId: number): string | undefined {
    return this.products.getById(productId)?.images[0];
  }

  cancel(o: Order): void {
    this.confirm.confirm({
      header: this.i18n.t('orders.cancelTitle'),
      message: this.i18n.t('orders.cancelMsg', { id: o.id }),
      acceptLabel: this.i18n.t('orders.cancelYes'),
      rejectLabel: this.i18n.t('orders.keep'),
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.orders.updateStatus(o.id, 'Cancelled');
        this.toast.add({ severity: 'info', summary: this.i18n.t('toast.orderCancelled'), detail: o.id, life: 2500 });
      },
    });
  }
}
