import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressBarModule } from 'primeng/progressbar';
import { CartService, FREE_SHIPPING_THRESHOLD } from '../../core/cart.service';
import { I18N_PIPES } from '../../core/i18n/pipes';
import { Bottle } from '../../shared/bottle';
import { Icons } from '../../shared/icons';

@Component({
  selector: 'app-cart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, FaIconComponent, ButtonModule, InputNumberModule, ProgressBarModule, Bottle, ...I18N_PIPES],
  template: `
    <div class="container-x py-10">
      <h1 class="mb-8 text-4xl font-bold">{{ 'cart.title' | t }}</h1>

      @if (cart.isEmpty()) {
        <div class="card flex flex-col items-center py-20 text-center">
          <fa-icon [icon]="i.bag" class="text-5xl text-stone-300" />
          <h2 class="mt-4 text-2xl font-semibold">{{ 'cart.empty' | t }}</h2>
          <p class="mt-1 text-stone-500">{{ 'cart.emptyText' | t }}</p>
          <p-button class="mt-6" routerLink="/shop">{{ 'cart.startShopping' | t }}</p-button>
        </div>
      } @else {
        <div class="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div class="card divide-y divide-stone-100">
            @for (line of cart.lines(); track line.product.id) {
              <div class="flex gap-4 p-4 sm:p-5">
                <a [routerLink]="['/product', line.product.id]" class="flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-100"
                   [class.p-2]="!line.product.images.length">
                  <app-bottle class="h-full w-full" [color]="line.product.color" [name]="line.product.name" [brand]="line.product.brand"
                              [image]="line.product.images[0]" fit="cover" />
                </a>
                <div class="flex flex-1 flex-col">
                  <div class="flex justify-between gap-2">
                    <div>
                      <div class="text-xs font-semibold uppercase tracking-widest text-amber-700">{{ line.product.brand }}</div>
                      <a [routerLink]="['/product', line.product.id]" class="font-display text-lg font-semibold hover:text-amber-700">{{ line.product.name }}</a>
                      <div class="text-xs text-stone-500">{{ line.product.concentration | tv: 'conc' }} · {{ line.product.volumeMl }} ml</div>
                    </div>
                    <div class="text-end font-semibold">{{ line.lineTotal | money }}</div>
                  </div>
                  <div class="mt-auto flex items-center justify-between pt-3">
                    <p-inputnumber [ngModel]="line.qty" (ngModelChange)="cart.setQty(line.product.id, $event ?? 1)" dir="ltr"
                                   [showButtons]="true" buttonLayout="horizontal" [min]="1" [max]="line.product.stock"
                                   size="small" inputStyleClass="w-12 text-center" />
                    <button class="text-sm text-stone-500 hover:text-red-600" (click)="cart.remove(line.product.id)">
                      <fa-icon [icon]="i.trash" /> {{ 'cart.remove' | t }}
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

          <aside class="card h-fit p-6 lg:sticky lg:top-24">
            <h2 class="mb-4 text-xl font-semibold">{{ 'cart.summary' | t }}</h2>
            @if (remaining() > 0) {
              <p class="mb-2 text-sm text-stone-600">{{ 'cart.addMore' | t: { amount: (remaining() | money) } }}</p>
            } @else {
              <p class="mb-2 text-sm font-medium text-emerald-700"><fa-icon [icon]="i.truck" /> {{ 'cart.freeUnlocked' | t }}</p>
            }
            <p-progressbar [value]="progress()" [showValue]="false" styleClass="!h-1.5 mb-6" />
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between"><dt class="text-stone-500">{{ 'cart.subtotalItems' | t: { n: cart.count() } }}</dt><dd>{{ cart.subtotal() | money }}</dd></div>
              <div class="flex justify-between"><dt class="text-stone-500">{{ 'common.shipping' | t }}</dt><dd>{{ cart.shipping() ? (cart.shipping() | money) : ('common.free' | t) }}</dd></div>
              <div class="flex justify-between border-t border-stone-200 pt-3 text-lg font-bold"><dt>{{ 'common.total' | t }}</dt><dd>{{ cart.total() | money }}</dd></div>
            </dl>
            <p-button routerLink="/checkout" size="large" styleClass="mt-6 w-full"><fa-icon [icon]="i.lock" /> {{ 'cart.checkout' | t }}</p-button>
            <a routerLink="/shop" class="mt-4 block text-center text-sm text-stone-500 hover:text-amber-700">
              <fa-icon [icon]="i.arrowLeft" class="inline-block rtl:-scale-x-100" /> {{ 'cart.continue' | t }}
            </a>
          </aside>
        </div>
      }
    </div>
  `,
})
export class Cart {
  protected readonly cart = inject(CartService);
  protected readonly i = Icons;
  protected readonly remaining = computed(() => Math.max(0, FREE_SHIPPING_THRESHOLD - this.cart.subtotal()));
  protected readonly progress = computed(() => Math.min(100, (this.cart.subtotal() / FREE_SHIPPING_THRESHOLD) * 100));
}
