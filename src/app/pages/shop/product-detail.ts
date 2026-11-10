import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { CartService, FREE_SHIPPING_THRESHOLD } from '../../core/cart.service';
import { TranslationKey } from '../../core/i18n/en';
import { I18nService } from '../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../core/i18n/pipes';
import { ImageStore } from '../../core/image-store.service';
import { ProductService } from '../../core/product.service';
import { WishlistService } from '../../core/wishlist.service';
import { Bottle } from '../../shared/bottle';
import { Icons } from '../../shared/icons';
import { ProductCard } from '../../shared/product-card';

@Component({
  selector: 'app-product-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, FaIconComponent, ButtonModule, DividerModule, InputNumberModule, RatingModule, TagModule, Bottle, ProductCard, ...I18N_PIPES],
  template: `
    @if (product(); as p) {
      <div class="container-x py-8">
        <nav class="mb-6 text-sm text-stone-500">
          <a routerLink="/" class="hover:text-amber-700">{{ 'nav.home' | t }}</a> /
          <a routerLink="/shop" class="hover:text-amber-700">{{ 'nav.shopAll' | t }}</a> /
          <a routerLink="/shop" [queryParams]="{ family: p.family }" class="hover:text-amber-700">{{ p.family | tv: 'family' }}</a> /
          <span class="text-stone-800">{{ p.name }}</span>
        </nav>

        <div class="grid gap-10 lg:grid-cols-2">
          <!-- Gallery -->
          <div class="flex flex-col gap-3">
            <div class="card group relative flex h-[28rem] items-center justify-center overflow-hidden bg-gradient-to-br from-stone-100 to-white lg:h-[34rem]"
                 tabindex="0" (keydown.arrowLeft)="step(i18n.isRtl() ? 1 : -1)" (keydown.arrowRight)="step(i18n.isRtl() ? -1 : 1)">
              @if (photos().length) {
                <img [src]="photos()[active()]" [alt]="p.name" class="h-full w-full object-cover" />
                @if (photos().length > 1) {
                  <button type="button" (click)="step(-1)" [attr.aria-label]="'pd.prevPhoto' | t"
                          class="absolute start-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow transition hover:scale-110">
                    <fa-icon [icon]="i.chevronLeft" class="rtl:-scale-x-100" />
                  </button>
                  <button type="button" (click)="step(1)" [attr.aria-label]="'pd.nextPhoto' | t"
                          class="absolute end-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow transition hover:scale-110">
                    <fa-icon [icon]="i.chevronRight" class="rtl:-scale-x-100" />
                  </button>
                  <span class="absolute bottom-3 end-3 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white" dir="ltr">
                    {{ active() + 1 }} / {{ photos().length }}
                  </span>
                }
              } @else {
                <div class="absolute inset-20 rounded-full blur-3xl" [style.background]="p.color + '55'"></div>
                <app-bottle class="relative h-full p-10" [color]="p.color" [name]="p.name" [brand]="p.brand" />
              }
            </div>
            @if (photos().length > 1) {
              <div class="grid grid-cols-5 gap-3">
                @for (src of photos(); track $index) {
                  <button type="button" (click)="active.set($index)" [attr.aria-label]="'pd.photo' | t: { n: $index + 1 }"
                          class="aspect-square overflow-hidden rounded-xl border-2 bg-stone-100 transition"
                          [class.border-amber-500]="$index === active()" [class.border-transparent]="$index !== active()"
                          [class.opacity-60]="$index !== active()">
                    <img [src]="src" alt="" class="h-full w-full object-cover" />
                  </button>
                }
              </div>
            }
          </div>

          <div>
            <span class="text-sm font-semibold uppercase tracking-widest text-amber-700">{{ p.brand }}</span>
            <h1 class="mt-1 text-4xl font-bold">{{ p.name }}</h1>
            <div class="mt-3 flex items-center gap-3 text-sm text-stone-500">
              <p-rating [ngModel]="p.rating" [readonly]="true" dir="ltr" />
              <span>{{ p.rating.toFixed(1) }} · {{ 'pd.reviews' | t: { n: p.reviews } }}</span>
            </div>

            <div class="mt-5 flex items-baseline gap-3">
              <span class="text-3xl font-bold">{{ p.price | money }}</span>
              @if (p.oldPrice) {
                <span class="text-lg text-stone-400 line-through">{{ p.oldPrice | money }}</span>
                <p-tag severity="danger" [value]="'pd.sale' | t" />
              }
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <p-tag [value]="p.gender | tv: 'gender'" severity="secondary" />
              <p-tag [value]="p.family | tv: 'family'" severity="secondary" />
              <p-tag [value]="p.concentration | tv: 'conc'" severity="secondary" />
              <p-tag [value]="p.volumeMl + ' ml'" severity="secondary" />
            </div>

            <p class="mt-6 leading-relaxed text-stone-600">{{ p.description }}</p>

            <p-divider />

            <h3 class="mb-4 text-lg font-semibold">{{ 'pd.pyramid' | t }}</h3>
            <div class="grid gap-3 sm:grid-cols-3">
              @for (layer of pyramid(); track layer.t) {
                <div class="rounded-xl bg-stone-100 p-4">
                  <div class="text-xs font-semibold uppercase tracking-wider text-stone-500">{{ layer.t | t }}</div>
                  <div class="mt-1 text-sm font-medium">{{ layer.n.join(', ') }}</div>
                </div>
              }
            </div>

            <p-divider />

            <div class="mb-4 text-sm">
              @if (p.stock === 0) {
                <span class="font-medium text-red-600"><fa-icon [icon]="i.warning" /> {{ 'pd.outOfStock' | t }}</span>
              } @else if (p.stock <= 5) {
                <span class="font-medium text-amber-700"><fa-icon [icon]="i.fire" /> {{ 'pd.hurry' | t: { n: p.stock } }}</span>
              } @else {
                <span class="font-medium text-emerald-700"><fa-icon [icon]="i.checkCircle" /> {{ 'pd.inStock' | t }}</span>
              }
              @if (inCart()) { <span class="ms-2 text-stone-500">{{ 'pd.inCart' | t: { n: inCart() } }}</span> }
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <p-inputnumber [(ngModel)]="qty" [showButtons]="true" buttonLayout="horizontal" [min]="1" [max]="Math.max(1, p.stock - inCart())"
                             [disabled]="p.stock - inCart() <= 0" inputStyleClass="w-14 text-center" dir="ltr" />
              <p-button size="large" [disabled]="p.stock - inCart() <= 0" (onClick)="addToCart()" styleClass="flex-1">
                <fa-icon [icon]="i.cartPlus" /> {{ 'pd.addToCart' | t }}
              </p-button>
              <p-button size="large" severity="secondary" [outlined]="true" (onClick)="toggleWish()" [ariaLabel]="'pd.toggleWish' | t">
                <fa-icon [icon]="wished() ? i.heart : i.heartOutline" [class.text-rose-500]="wished()" />
              </p-button>
            </div>

            <div class="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-stone-500">
              <div class="rounded-xl border border-stone-200 p-3"><fa-icon [icon]="i.truck" class="mb-1 block text-lg text-amber-700" />{{ 'pd.freeShipping' | t: { amount: (freeShipping | money: true) } }}</div>
              <div class="rounded-xl border border-stone-200 p-3"><fa-icon [icon]="i.shield" class="mb-1 block text-lg text-amber-700" />{{ 'pd.authentic' | t }}</div>
              <div class="rounded-xl border border-stone-200 p-3"><fa-icon [icon]="i.reset" class="mb-1 block text-lg text-amber-700" />{{ 'pd.returns' | t }}</div>
            </div>
          </div>
        </div>

        @if (related().length) {
          <section class="mt-20">
            <h2 class="mb-6 text-2xl font-bold">{{ 'pd.related' | t }}</h2>
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              @for (r of related(); track r.id) { <app-product-card [product]="r" /> }
            </div>
          </section>
        }
      </div>
    } @else {
      <div class="container-x py-24 text-center">
        <h1 class="text-3xl font-bold">{{ 'pd.notFound' | t }}</h1>
        <p-button class="mt-6 inline-block" routerLink="/shop">{{ 'pd.backToShop' | t }}</p-button>
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
  private readonly images = inject(ImageStore);
  protected readonly i18n = inject(I18nService);
  protected readonly i = Icons;
  protected readonly Math = Math;
  protected readonly freeShipping = FREE_SHIPPING_THRESHOLD;

  protected readonly product = computed(() => this.products.getById(Number(this.id())));
  protected readonly photos = computed(() =>
    (this.product()?.images ?? []).map((ref) => this.images.resolve(ref)).filter((s): s is string => !!s),
  );
  protected readonly active = linkedSignal(() => (this.product(), 0));
  protected readonly qty = linkedSignal(() => (this.product(), 1));
  protected readonly pyramid = computed(() => {
    const p = this.product();
    return p
      ? ([
          { t: 'pd.top', n: p.topNotes },
          { t: 'pd.heart', n: p.heartNotes },
          { t: 'pd.base', n: p.baseNotes },
        ] satisfies { t: TranslationKey; n: string[] }[])
      : [];
  });
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

  step(delta: number): void {
    const n = this.photos().length;
    if (n > 1) this.active.update((i) => (i + delta + n) % n);
  }

  addToCart(): void {
    const p = this.product()!;
    const added = this.cart.add(p.id, this.qty());
    this.toast.add({ severity: 'success', summary: this.i18n.t('toast.addedToCart'), detail: `${added} × ${p.name}`, life: 2500 });
    this.qty.set(1);
  }

  toggleWish(): void {
    const added = this.wishlist.toggle(this.product()!.id);
    this.toast.add({ severity: 'info', summary: this.i18n.t(added ? 'toast.savedWish' : 'toast.removedWish'), life: 2000 });
  }
}
