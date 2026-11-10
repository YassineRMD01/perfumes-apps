import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressBarModule } from 'primeng/progressbar';
import { CartService, FREE_SHIPPING_THRESHOLD } from '../../core/cart.service';
import { Bottle } from '../../shared/bottle';
import { Icons } from '../../shared/icons';

@Component({
  selector: 'app-cart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, FormsModule, RouterLink, FaIconComponent, ButtonModule, InputNumberModule, ProgressBarModule, Bottle],
  template: `
    <div class="container-x py-10">
      <h1 class="mb-8 text-4xl font-bold">Your bag</h1>

      @if (cart.isEmpty()) {
        <div class="card flex flex-col items-center py-20 text-center">
          <fa-icon [icon]="i.bag" class="text-5xl text-stone-300" />
          <h2 class="mt-4 text-2xl font-semibold">Your bag is empty</h2>
          <p class="mt-1 text-stone-500">Discover our collection and find your signature scent.</p>
          <p-button class="mt-6" routerLink="/shop">Start shopping</p-button>
        </div>
      } @else {
        <div class="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div class="card divide-y divide-stone-100">
            @for (line of cart.lines(); track line.product.id) {
              <div class="flex gap-4 p-4 sm:p-5">
                <a [routerLink]="['/product', line.product.id]" class="flex h-28 w-24 shrink-0 items-center justify-center rounded-xl bg-stone-100 p-2">
                  <app-bottle class="h-full" [color]="line.product.color" [name]="line.product.name" [brand]="line.product.brand" [imageUrl]="line.product.imageUrl" />
                </a>
                <div class="flex flex-1 flex-col">
                  <div class="flex justify-between gap-2">
                    <div>
                      <div class="text-xs font-semibold uppercase tracking-widest text-amber-700">{{ line.product.brand }}</div>
                      <a [routerLink]="['/product', line.product.id]" class="font-display text-lg font-semibold hover:text-amber-700">{{ line.product.name }}</a>
                      <div class="text-xs text-stone-500">{{ line.product.concentration }} · {{ line.product.volumeMl }} ml</div>
                    </div>
                    <div class="text-right font-semibold">{{ line.lineTotal | currency }}</div>
                  </div>
                  <div class="mt-auto flex items-center justify-between pt-3">
                    <p-inputnumber [ngModel]="line.qty" (ngModelChange)="cart.setQty(line.product.id, $event ?? 1)"
                                   [showButtons]="true" buttonLayout="horizontal" [min]="1" [max]="line.product.stock"
                                   size="small" inputStyleClass="w-12 text-center" />
                    <button class="text-sm text-stone-500 hover:text-red-600" (click)="cart.remove(line.product.id)">
                      <fa-icon [icon]="i.trash" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

          <aside class="card h-fit p-6 lg:sticky lg:top-24">
            <h2 class="mb-4 text-xl font-semibold">Order summary</h2>
            @if (remaining() > 0) {
              <p class="mb-2 text-sm text-stone-600">Add <b>{{ remaining() | currency }}</b> more for free shipping.</p>
            } @else {
              <p class="mb-2 text-sm font-medium text-emerald-700"><fa-icon [icon]="i.truck" /> You’ve unlocked free shipping!</p>
            }
            <p-progressbar [value]="progress()" [showValue]="false" styleClass="!h-1.5 mb-6" />
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between"><dt class="text-stone-500">Subtotal ({{ cart.count() }} items)</dt><dd>{{ cart.subtotal() | currency }}</dd></div>
              <div class="flex justify-between"><dt class="text-stone-500">Shipping</dt><dd>{{ cart.shipping() ? (cart.shipping() | currency) : 'Free' }}</dd></div>
              <div class="flex justify-between border-t border-stone-200 pt-3 text-lg font-bold"><dt>Total</dt><dd>{{ cart.total() | currency }}</dd></div>
            </dl>
            <p-button routerLink="/checkout" size="large" styleClass="mt-6 w-full"><fa-icon [icon]="i.lock" /> Secure checkout</p-button>
            <a routerLink="/shop" class="mt-4 block text-center text-sm text-stone-500 hover:text-amber-700">
              <fa-icon [icon]="i.arrowLeft" /> Continue shopping
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
