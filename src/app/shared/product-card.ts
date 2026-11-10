import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CartService } from '../core/cart.service';
import { I18nService } from '../core/i18n/i18n.service';
import { I18N_PIPES } from '../core/i18n/pipes';
import { ImageStore } from '../core/image-store.service';
import { Perfume } from '../core/models';
import { WishlistService } from '../core/wishlist.service';
import { Bottle } from './bottle';
import { Icons } from './icons';

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FaIconComponent, ButtonModule, TagModule, Bottle, ...I18N_PIPES],
  template: `
    @let p = product();
    <article class="group card relative flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
      <button type="button" (click)="toggleWish()"
              class="absolute end-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow transition hover:scale-110"
              [class.text-rose-500]="wished()" [class.text-stone-400]="!wished()"
              [attr.aria-label]="(wished() ? 'card.removeWish' : 'card.addWish') | t">
        <fa-icon [icon]="wished() ? i.heart : i.heartOutline" />
      </button>
      <div class="pointer-events-none absolute start-3 top-3 z-10 flex flex-col items-start gap-1">
        @if (discount()) { <p-tag severity="danger" [value]="'-' + discount() + '%'" /> }
        @if (p.stock === 0) { <p-tag severity="secondary" [value]="'card.soldOut' | t" /> }
        @else if (p.stock <= 5) { <p-tag severity="warn" [value]="'card.onlyLeft' | t: { n: p.stock }" /> }
      </div>

      <a [routerLink]="['/product', p.id]" class="relative block h-64 overflow-hidden bg-gradient-to-b from-stone-100 to-stone-50">
        @if (cover(); as src) {
          <img [src]="src" [alt]="p.name" loading="lazy"
               class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
               [class.group-hover:opacity-0]="!!hoverImage()" />
          @if (hoverImage(); as h) {
            <img [src]="h" alt="" loading="lazy"
                 class="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100" />
          }
        } @else {
          <div class="flex h-full items-center justify-center p-6">
            <app-bottle class="h-full transition duration-500 group-hover:scale-105" [color]="p.color" [name]="p.name" [brand]="p.brand" />
          </div>
        }
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
            <span class="text-lg font-bold">{{ p.price | money }}</span>
            @if (p.oldPrice) {
              <span class="ms-2 text-sm text-stone-400 line-through">{{ p.oldPrice | money }}</span>
            }
          </div>
          <p-button [rounded]="true" size="small" [disabled]="p.stock === 0" (onClick)="addToCart()"
                    [ariaLabel]="'card.addToCart' | t: { name: p.name }">
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
  private readonly images = inject(ImageStore);
  private readonly i18n = inject(I18nService);
  protected readonly i = Icons;

  protected readonly cover = computed(() => this.images.resolve(this.product().images[0]));
  protected readonly hoverImage = computed(() => this.images.resolve(this.product().images[1]));
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
        ? { severity: 'success', summary: this.i18n.t('toast.addedToCart'), detail: `${p.name} — ${p.brand}`, life: 2500 }
        : { severity: 'warn', summary: this.i18n.t('toast.stockLimit'), detail: this.i18n.t('toast.stockLimitDetail', { name: p.name }), life: 2500 },
    );
  }

  toggleWish(): void {
    const added = this.wishlist.toggle(this.product().id);
    this.toast.add({
      severity: 'info',
      summary: this.i18n.t(added ? 'toast.savedWish' : 'toast.removedWish'),
      detail: this.product().name,
      life: 2000,
    });
  }
}
