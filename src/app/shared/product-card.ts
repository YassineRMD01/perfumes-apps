import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Perfume } from '../core/models';
import { CartService } from '../core/cart.service';
import { WishlistService } from '../core/wishlist.service';
import { Bottle } from './bottle';
import { Icons } from './icons';

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RouterLink, FaIconComponent, ButtonModule, TagModule, Bottle],
  template: `
    @let p = product();
    <article class="group card relative flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
      <button type="button" (click)="toggleWish()"
              class="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow transition hover:scale-110"
              [class.text-rose-500]="wished()" [class.text-stone-400]="!wished()"
              [attr.aria-label]="wished() ? 'Remove from wishlist' : 'Add to wishlist'">
        <fa-icon [icon]="wished() ? i.heart : i.heartOutline" />
      </button>
      <div class="absolute left-3 top-3 z-10 flex flex-col gap-1">
        @if (discount()) { <p-tag severity="danger" [value]="'-' + discount() + '%'" /> }
        @if (p.stock === 0) { <p-tag severity="secondary" value="Sold out" /> }
        @else if (p.stock <= 5) { <p-tag severity="warn" [value]="'Only ' + p.stock + ' left'" /> }
      </div>

      <a [routerLink]="['/product', p.id]"
         class="relative flex h-60 items-center justify-center bg-gradient-to-b from-stone-100 to-stone-50 p-6">
        <app-bottle class="h-full transition duration-500 group-hover:scale-105"
                    [color]="p.color" [name]="p.name" [brand]="p.brand" [imageUrl]="p.imageUrl" />
      </a>

      <div class="flex flex-1 flex-col gap-1 p-4">
        <span class="text-xs font-semibold uppercase tracking-widest text-amber-700">{{ p.brand }}</span>
        <a [routerLink]="['/product', p.id]" class="font-display text-lg font-semibold leading-tight hover:text-amber-700">
          {{ p.name }}
        </a>
        <div class="flex items-center gap-2 text-xs text-stone-500">
          <span>{{ p.concentration }} · {{ p.volumeMl }} ml</span>
          <span>·</span>
          <span class="flex items-center gap-1"><fa-icon [icon]="i.star" class="text-amber-500" />{{ p.rating.toFixed(1) }}</span>
        </div>
        <div class="mt-auto flex items-end justify-between pt-3">
          <div>
            <span class="text-lg font-bold">{{ p.price | currency }}</span>
            @if (p.oldPrice) {
              <span class="ml-2 text-sm text-stone-400 line-through">{{ p.oldPrice | currency }}</span>
            }
          </div>
          <p-button [rounded]="true" size="small" [disabled]="p.stock === 0" (onClick)="addToCart()"
                    [attr.aria-label]="'Add ' + p.name + ' to cart'">
            <fa-icon [icon]="i.cartPlus" />
          </p-button>
        </div>
      </div>
    </article>
  `,
})
export class ProductCard {
  readonly product = input.required<Perfume>();

  private readonly cart = inject(CartService);
  private readonly wishlist = inject(WishlistService);
  private readonly toast = inject(MessageService);
  protected readonly i = Icons;

  protected readonly wished = computed(() => this.wishlist.ids().includes(this.product().id));
  protected readonly discount = computed(() => {
    const { price, oldPrice } = this.product();
    return oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;
  });

  addToCart(): void {
    const p = this.product();
    const added = this.cart.add(p.id);
    this.toast.add(
      added
        ? { severity: 'success', summary: 'Added to cart', detail: `${p.name} — ${p.brand}`, life: 2500 }
        : { severity: 'warn', summary: 'Stock limit reached', detail: `No more ${p.name} available.`, life: 2500 },
    );
  }

  toggleWish(): void {
    const added = this.wishlist.toggle(this.product().id);
    this.toast.add({
      severity: 'info',
      summary: added ? 'Saved to wishlist' : 'Removed from wishlist',
      detail: this.product().name,
      life: 2000,
    });
  }
}
