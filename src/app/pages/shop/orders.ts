import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { I18nService } from '../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../core/i18n/pipes';
import { Order, STATUS_SEVERITY } from '../../core/models';
import { OrderService } from '../../core/order.service';
import { ProductService } from '../../core/product.service';
import { Bottle } from '../../shared/bottle';
import { Icons } from '../../shared/icons';

@Component({
  selector: 'app-my-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FaIconComponent, AccordionModule, ButtonModule, MessageModule, TagModule, Bottle, ...I18N_PIPES],
  template: `
    <div class="container-x py-10">
      <h1 class="mb-8 text-4xl font-bold">{{ 'orders.title' | t }}</h1>

      @if (placed()) {
        <p-message severity="success" styleClass="mb-6">
          <fa-icon [icon]="i.checkCircle" class="me-2" /> {{ 'orders.thanks' | t: { id: placed()! } }}
        </p-message>
      }

      @if (orders.myOrders().length) {
        <p-accordion [value]="placed() ?? orders.myOrders()[0].id">
          @for (o of orders.myOrders(); track o.id) {
            <p-accordion-panel [value]="o.id" class="card mb-3 overflow-hidden">
              <p-accordion-header>
                <div class="flex flex-1 flex-wrap items-center gap-x-6 gap-y-1 pe-4 text-start">
                  <span class="font-semibold" dir="ltr">{{ o.id }}</span>
                  <span class="text-sm text-stone-500">{{ o.createdAt | ldate }}</span>
                  <span class="text-sm text-stone-500">{{ 'orders.items' | t: { n: o.items.length } }}</span>
                  <span class="ms-auto font-semibold">{{ o.total | money }}</span>
                  <p-tag [value]="o.status | tv: 'status'" [severity]="sev[o.status]" />
                </div>
              </p-accordion-header>
              <p-accordion-content>
                <div class="grid gap-6 md:grid-cols-[1fr_260px]">
                  <ul class="divide-y divide-stone-100">
                    @for (it of o.items; track it.productId) {
                      <li class="flex items-center gap-3 py-3">
                        <a [routerLink]="['/product', it.productId]" class="flex h-14 w-12 items-center justify-center overflow-hidden rounded-lg bg-stone-100">
                          <app-bottle class="h-full w-full" [color]="it.color" [name]="it.name" [brand]="it.brand" [image]="photo(it.productId)" fit="cover" />
                        </a>
                        <div class="flex-1 text-sm">
                          <div class="font-medium">{{ it.name }}</div>
                          <div class="text-xs text-stone-500">{{ it.brand }} · {{ it.qty }} × {{ it.price | money }}</div>
                        </div>
                        <div class="text-sm font-semibold">{{ it.price * it.qty | money }}</div>
                      </li>
                    }
                  </ul>
                  <div class="rounded-xl bg-stone-50 p-4 text-sm">
                    <div class="font-semibold">{{ 'orders.shipTo' | t }}</div>
                    <p class="text-stone-600">{{ o.shippingInfo.fullName }}<br />{{ o.shippingInfo.address }}<br />{{ o.shippingInfo.zip }} {{ o.shippingInfo.city }}, {{ o.shippingInfo.country }}</p>
                    <div class="mt-3 font-semibold">{{ 'orders.payment' | t }}</div>
                    <p class="text-stone-600">{{ o.payment | tv: 'payment' }}</p>
                    <div class="mt-3 flex justify-between"><span class="text-stone-500">{{ 'common.shipping' | t }}</span><span>{{ o.shipping ? (o.shipping | money) : ('common.free' | t) }}</span></div>
                    <div class="flex justify-between font-semibold"><span>{{ 'common.total' | t }}</span><span>{{ o.total | money }}</span></div>
                    @if (o.status === 'Pending') {
                      <p-button severity="danger" [outlined]="true" size="small" styleClass="mt-4 w-full" (onClick)="cancel(o)">
                        <fa-icon [icon]="i.close" /> {{ 'orders.cancel' | t }}
                      </p-button>
                    }
                  </div>
                </div>
              </p-accordion-content>
            </p-accordion-panel>
          }
        </p-accordion>
      } @else {
        <div class="card flex flex-col items-center py-20 text-center">
          <fa-icon [icon]="i.receipt" class="text-5xl text-stone-300" />
          <h2 class="mt-4 text-2xl font-semibold">{{ 'orders.none' | t }}</h2>
          <p-button class="mt-6" routerLink="/shop">{{ 'cart.startShopping' | t }}</p-button>
        </div>
      }
    </div>
  `,
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
