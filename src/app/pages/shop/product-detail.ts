import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { CartService } from '../../core/cart.service';
import { ProductService } from '../../core/product.service';
import { WishlistService } from '../../core/wishlist.service';
import { Bottle } from '../../shared/bottle';
import { Icons } from '../../shared/icons';
import { ProductCard } from '../../shared/product-card';

@Component({
  selector: 'app-product-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, FormsModule, RouterLink, FaIconComponent, ButtonModule, DividerModule, InputNumberModule, RatingModule, TagModule, Bottle, ProductCard],
  template: `
    @if (product(); as p) {
      <div class="container-x py-8">
        <nav class="mb-6 text-sm text-stone-500">
          <a routerLink="/" class="hover:text-amber-700">Home</a> /
          <a routerLink="/shop" class="hover:text-amber-700">Shop</a> /
          <a routerLink="/shop" [queryParams]="{ family: p.family }" class="hover:text-amber-700">{{ p.family }}</a> /
          <span class="text-stone-800">{{ p.name }}</span>
        </nav>

        <div class="grid gap-10 lg:grid-cols-2">
          <div class="card relative flex h-[28rem] items-center justify-center bg-gradient-to-br from-stone-100 to-white p-10 lg:h-[36rem]">
            <div class="absolute inset-20 rounded-full blur-3xl" [style.background]="p.color + '55'"></div>
            <app-bottle class="relative h-full" [color]="p.color" [name]="p.name" [brand]="p.brand" [imageUrl]="p.imageUrl" />
          </div>

          <div>
            <span class="text-sm font-semibold uppercase tracking-widest text-amber-700">{{ p.brand }}</span>
            <h1 class="mt-1 text-4xl font-bold">{{ p.name }}</h1>
            <div class="mt-3 flex items-center gap-3 text-sm text-stone-500">
              <p-rating [ngModel]="p.rating" [readonly]="true" />
              <span>{{ p.rating.toFixed(1) }} · {{ p.reviews }} reviews</span>
            </div>

            <div class="mt-5 flex items-baseline gap-3">
              <span class="text-3xl font-bold">{{ p.price | currency }}</span>
              @if (p.oldPrice) {
                <span class="text-lg text-stone-400 line-through">{{ p.oldPrice | currency }}</span>
                <p-tag severity="danger" value="Sale" />
              }
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <p-tag [value]="p.gender" severity="secondary" />
              <p-tag [value]="p.family" severity="secondary" />
              <p-tag [value]="p.concentration" severity="secondary" />
              <p-tag [value]="p.volumeMl + ' ml'" severity="secondary" />
            </div>

            <p class="mt-6 leading-relaxed text-stone-600">{{ p.description }}</p>

            <p-divider />

            <h3 class="mb-4 text-lg font-semibold">Olfactory pyramid</h3>
            <div class="grid gap-3 sm:grid-cols-3">
              @for (layer of [{ t: 'Top notes', n: p.topNotes }, { t: 'Heart notes', n: p.heartNotes }, { t: 'Base notes', n: p.baseNotes }]; track layer.t) {
                <div class="rounded-xl bg-stone-100 p-4">
                  <div class="text-xs font-semibold uppercase tracking-wider text-stone-500">{{ layer.t }}</div>
                  <div class="mt-1 text-sm font-medium">{{ layer.n.join(', ') }}</div>
                </div>
              }
            </div>

            <p-divider />

            <div class="mb-4 text-sm">
              @if (p.stock === 0) {
                <span class="font-medium text-red-600"><fa-icon [icon]="i.warning" /> Out of stock</span>
              } @else if (p.stock <= 5) {
                <span class="font-medium text-amber-700"><fa-icon [icon]="i.fire" /> Hurry — only {{ p.stock }} left</span>
              } @else {
                <span class="font-medium text-emerald-700"><fa-icon [icon]="i.checkCircle" /> In stock, ships within 24h</span>
              }
              @if (inCart()) { <span class="ml-2 text-stone-500">({{ inCart() }} in your cart)</span> }
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <p-inputnumber [(ngModel)]="qty" [showButtons]="true" buttonLayout="horizontal" [min]="1" [max]="Math.max(1, p.stock - inCart())"
                             [disabled]="p.stock - inCart() <= 0" inputStyleClass="w-14 text-center" />
              <p-button size="large" [disabled]="p.stock - inCart() <= 0" (onClick)="addToCart()" styleClass="flex-1">
                <fa-icon [icon]="i.cartPlus" /> Add to cart
              </p-button>
              <p-button size="large" severity="secondary" [outlined]="true" (onClick)="toggleWish()"
                        [attr.aria-label]="'Toggle wishlist'">
                <fa-icon [icon]="wished() ? i.heart : i.heartOutline" [class.text-rose-500]="wished()" />
              </p-button>
            </div>

            <div class="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-stone-500">
              <div class="rounded-xl border border-stone-200 p-3"><fa-icon [icon]="i.truck" class="mb-1 block text-lg text-amber-700" />Free shipping $150+</div>
              <div class="rounded-xl border border-stone-200 p-3"><fa-icon [icon]="i.shield" class="mb-1 block text-lg text-amber-700" />Authentic</div>
              <div class="rounded-xl border border-stone-200 p-3"><fa-icon [icon]="i.reset" class="mb-1 block text-lg text-amber-700" />30-day returns</div>
            </div>
          </div>
        </div>

        @if (related().length) {
          <section class="mt-20">
            <h2 class="mb-6 text-2xl font-bold">You may also like</h2>
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              @for (r of related(); track r.id) { <app-product-card [product]="r" /> }
            </div>
          </section>
        }
      </div>
    } @else {
      <div class="container-x py-24 text-center">
        <h1 class="text-3xl font-bold">Perfume not found</h1>
        <p-button class="mt-6 inline-block" routerLink="/shop">Back to shop</p-button>
      </div>
    }
  `,
})
export class ProductDetail {
  readonly id = input.required<string>();

  private readonly products = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly wishlist = inject(WishlistService);
  private readonly toast = inject(MessageService);
  protected readonly i = Icons;
  protected readonly Math = Math;

  protected readonly product = computed(() => this.products.getById(Number(this.id())));
  protected readonly qty = linkedSignal(() => (this.product(), 1));
  protected readonly inCart = computed(() => {
    const p = this.product();
    return p ? this.cart.lines().find((l) => l.product.id === p.id)?.qty ?? 0 : 0;
  });
  protected readonly wished = computed(() => this.wishlist.ids().includes(Number(this.id())));
  protected readonly related = computed(() => {
    const p = this.product();
    if (!p) return [];
    return this.products
      .products()
      .filter((x) => x.id !== p.id && (x.family === p.family || x.brand === p.brand))
      .slice(0, 4);
  });

  addToCart(): void {
    const p = this.product()!;
    const added = this.cart.add(p.id, this.qty());
    this.toast.add({ severity: 'success', summary: 'Added to cart', detail: `${added} × ${p.name}`, life: 2500 });
    this.qty.set(1);
  }

  toggleWish(): void {
    const added = this.wishlist.toggle(this.product()!.id);
    this.toast.add({ severity: 'info', summary: added ? 'Saved to wishlist' : 'Removed from wishlist', life: 2000 });
  }
}
