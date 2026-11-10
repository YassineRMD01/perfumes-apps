import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { Order, STATUS_SEVERITY } from '../../core/models';
import { OrderService } from '../../core/order.service';
import { Bottle } from '../../shared/bottle';
import { Icons } from '../../shared/icons';

@Component({
  selector: 'app-my-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, RouterLink, FaIconComponent, AccordionModule, ButtonModule, MessageModule, TagModule, Bottle],
  template: `
    <div class="container-x py-10">
      <h1 class="mb-8 text-4xl font-bold">My orders</h1>

      @if (placed()) {
        <p-message severity="success" styleClass="mb-6">
          <fa-icon [icon]="i.checkCircle" class="mr-2" /> Thank you! Your order <b class="mx-1">{{ placed() }}</b> has been received.
        </p-message>
      }

      @if (orders.myOrders().length) {
        <p-accordion [value]="placed() ?? orders.myOrders()[0].id">
          @for (o of orders.myOrders(); track o.id) {
            <p-accordion-panel [value]="o.id" class="card mb-3 overflow-hidden">
              <p-accordion-header>
                <div class="flex flex-1 flex-wrap items-center gap-x-6 gap-y-1 pr-4 text-left">
                  <span class="font-semibold">{{ o.id }}</span>
                  <span class="text-sm text-stone-500">{{ o.createdAt | date: 'mediumDate' }}</span>
                  <span class="text-sm text-stone-500">{{ o.items.length }} item(s)</span>
                  <span class="ml-auto font-semibold">{{ o.total | currency }}</span>
                  <p-tag [value]="o.status" [severity]="sev[o.status]" />
                </div>
              </p-accordion-header>
              <p-accordion-content>
                <div class="grid gap-6 md:grid-cols-[1fr_260px]">
                  <ul class="divide-y divide-stone-100">
                    @for (it of o.items; track it.productId) {
                      <li class="flex items-center gap-3 py-3">
                        <a [routerLink]="['/product', it.productId]" class="flex h-14 w-12 items-center justify-center rounded-lg bg-stone-100 p-1">
                          <app-bottle class="h-full" [color]="it.color" [name]="it.name" [brand]="it.brand" />
                        </a>
                        <div class="flex-1 text-sm">
                          <div class="font-medium">{{ it.name }}</div>
                          <div class="text-xs text-stone-500">{{ it.brand }} · {{ it.qty }} × {{ it.price | currency }}</div>
                        </div>
                        <div class="text-sm font-semibold">{{ it.price * it.qty | currency }}</div>
                      </li>
                    }
                  </ul>
                  <div class="rounded-xl bg-stone-50 p-4 text-sm">
                    <div class="font-semibold">Ship to</div>
                    <p class="text-stone-600">{{ o.shippingInfo.fullName }}<br />{{ o.shippingInfo.address }}<br />{{ o.shippingInfo.zip }} {{ o.shippingInfo.city }}, {{ o.shippingInfo.country }}</p>
                    <div class="mt-3 font-semibold">Payment</div>
                    <p class="text-stone-600">{{ o.payment }}</p>
                    <div class="mt-3 flex justify-between"><span class="text-stone-500">Shipping</span><span>{{ o.shipping ? (o.shipping | currency) : 'Free' }}</span></div>
                    <div class="flex justify-between font-semibold"><span>Total</span><span>{{ o.total | currency }}</span></div>
                    @if (o.status === 'Pending') {
                      <p-button severity="danger" [outlined]="true" size="small" styleClass="mt-4 w-full" (onClick)="cancel(o)">
                        <fa-icon [icon]="i.close" /> Cancel order
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
          <h2 class="mt-4 text-2xl font-semibold">No orders yet</h2>
          <p-button class="mt-6" routerLink="/shop">Start shopping</p-button>
        </div>
      }
    </div>
  `,
})
export class MyOrders {
  readonly placed = input<string>();
  protected readonly orders = inject(OrderService);
  private readonly confirm = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  protected readonly i = Icons;
  protected readonly sev = STATUS_SEVERITY;

  cancel(o: Order): void {
    this.confirm.confirm({
      header: 'Cancel order?',
      message: `Are you sure you want to cancel order ${o.id}?`,
      acceptLabel: 'Yes, cancel',
      rejectLabel: 'Keep order',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.orders.updateStatus(o.id, 'Cancelled');
        this.toast.add({ severity: 'info', summary: 'Order cancelled', detail: o.id, life: 2500 });
      },
    });
  }
}
