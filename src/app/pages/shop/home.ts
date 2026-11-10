import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { FREE_SHIPPING_THRESHOLD } from '../../core/cart.service';
import { TranslationKey } from '../../core/i18n/en';
import { I18nService } from '../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../core/i18n/pipes';
import { FAMILIES, Family } from '../../core/models';
import { ProductService } from '../../core/product.service';
import { Bottle } from '../../shared/bottle';
import { Icons } from '../../shared/icons';
import { ProductCard } from '../../shared/product-card';

const FAMILY_COLORS: Record<Family, string> = {
  Floral: 'from-pink-100 to-rose-200',
  Woody: 'from-amber-100 to-stone-300',
  Oriental: 'from-orange-100 to-red-200',
  Fresh: 'from-sky-100 to-emerald-200',
  Citrus: 'from-yellow-100 to-lime-200',
  Gourmand: 'from-orange-50 to-amber-200',
};

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FaIconComponent, ButtonModule, CarouselModule, ProductCard, Bottle, ...I18N_PIPES],
  template: `
    <section class="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 text-white">
      <div class="pointer-events-none absolute -end-32 -top-32 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl"></div>
      <div class="container-x grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <div>
          <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-widest text-amber-300">
            <fa-icon [icon]="i.magic" /> {{ 'home.badge' | t }}
          </span>
          <h1 class="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl [&_em]:text-amber-400" [innerHTML]="'home.title' | t"></h1>
          <p class="mt-5 max-w-md text-stone-300">{{ 'home.subtitle' | t }}</p>
          <div class="mt-8 flex flex-wrap gap-3">
            <p-button routerLink="/shop" size="large">{{ 'home.shopCta' | t }} <fa-icon [icon]="i.arrowRight" class="rtl:-scale-x-100" /></p-button>
            <p-button routerLink="/shop" [queryParams]="{ family: 'Oriental' }" size="large" severity="secondary" [outlined]="true"
                      styleClass="!text-white !border-white/40 hover:!bg-white/10">{{ 'home.discoverOud' | t }}</p-button>
          </div>
        </div>
        @if (hero; as h) {
          <a [routerLink]="['/product', h.id]" class="relative mx-auto flex h-80 w-64 items-center justify-center md:h-[26rem] md:w-80">
            <div class="absolute inset-6 rounded-full bg-amber-400/20 blur-2xl"></div>
            <app-bottle class="relative h-full w-full overflow-hidden rounded-3xl" [color]="h.color" [name]="h.name" [brand]="h.brand"
                        [image]="h.images[0]" fit="cover" />
          </a>
        }
      </div>
    </section>

    <section class="border-b border-stone-200 bg-white">
      <div class="container-x grid grid-cols-2 gap-6 py-6 text-sm md:grid-cols-4">
        @for (perk of perks; track perk.title) {
          <div class="flex items-center gap-3">
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-700"><fa-icon [icon]="perk.icon" /></span>
            <div>
              <div class="font-semibold">{{ perk.title | t }}</div>
              <div class="text-xs text-stone-500">{{ perk.text | t: { amount: (freeShipping | money: true) } }}</div>
            </div>
          </div>
        }
      </div>
    </section>

    <section class="container-x py-16">
      <div class="mb-8 flex items-end justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-amber-700">{{ 'home.bestsellers' | t }}</p>
          <h2 class="text-3xl font-bold">{{ 'home.featured' | t }}</h2>
        </div>
        <a routerLink="/shop" class="nav-link hidden sm:inline">{{ 'home.viewAll' | t }} <fa-icon [icon]="i.arrowRight" class="inline-block rtl:-scale-x-100" /></a>
      </div>
      <!-- The carousel is laid out LTR internally so its sliding math stays correct in Arabic -->
      <div dir="ltr">
        <p-carousel [value]="products.featured()" [numVisible]="4" [numScroll]="1" [circular]="true"
                    [responsiveOptions]="responsive" [showIndicators]="false">
          <ng-template #item let-p>
            <div class="h-full p-2" [attr.dir]="i18n.dir()"><app-product-card [product]="p" /></div>
          </ng-template>
        </p-carousel>
      </div>
    </section>

    <section class="bg-white py-16">
      <div class="container-x">
        <p class="text-xs font-semibold uppercase tracking-widest text-amber-700">{{ 'home.families' | t }}</p>
        <h2 class="mb-8 text-3xl font-bold">{{ 'home.shopByScent' | t }}</h2>
        <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          @for (f of families; track f) {
            <a routerLink="/shop" [queryParams]="{ family: f }"
               class="group rounded-2xl bg-gradient-to-br p-5 transition hover:-translate-y-1 hover:shadow-lg {{ colors[f] }}">
              <fa-icon [icon]="i.drop" class="text-2xl text-stone-700/70" />
              <div class="font-display mt-6 text-xl font-semibold">{{ f | tv: 'family' }}</div>
              <div class="text-xs text-stone-600">{{ f | tv: 'familyBlurb' }}</div>
            </a>
          }
        </div>
      </div>
    </section>

    <section class="container-x py-16">
      <p class="text-xs font-semibold uppercase tracking-widest text-amber-700">{{ 'home.justLanded' | t }}</p>
      <h2 class="mb-8 text-3xl font-bold">{{ 'home.newArrivals' | t }}</h2>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        @for (p of products.newArrivals(); track p.id) {
          <app-product-card [product]="p" />
        }
      </div>
    </section>

    <section class="container-x">
      <div class="rounded-3xl bg-gradient-to-r from-amber-600 to-amber-800 px-6 py-12 text-center text-white sm:px-12">
        <h2 class="text-3xl font-bold">{{ 'home.newsletterTitle' | t }}</h2>
        <p class="mt-2 text-amber-100">{{ 'home.newsletterText' | t }}</p>
        <form class="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row" (submit)="$event.preventDefault()">
          <input type="email" [placeholder]="'home.emailPlaceholder' | t" dir="ltr"
                 class="flex-1 rounded-full bg-white px-5 py-3 text-stone-800 outline-none" />
          <button class="rounded-full bg-stone-900 px-6 py-3 font-semibold hover:bg-stone-800">{{ 'home.subscribe' | t }}</button>
        </form>
      </div>
    </section>
  `,
})
export class Home {
  protected readonly products = inject(ProductService);
  protected readonly i18n = inject(I18nService);
  protected readonly i = Icons;
  protected readonly families = FAMILIES;
  protected readonly colors = FAMILY_COLORS;
  protected readonly freeShipping = FREE_SHIPPING_THRESHOLD;
  protected readonly hero = this.products.featured()[0] ?? this.products.products()[0];

  protected readonly perks: { icon: typeof Icons.truck; title: TranslationKey; text: TranslationKey }[] = [
    { icon: Icons.truck, title: 'perk.delivery', text: 'perk.deliveryText' },
    { icon: Icons.shield, title: 'perk.authentic', text: 'perk.authenticText' },
    { icon: Icons.gem, title: 'perk.samples', text: 'perk.samplesText' },
    { icon: Icons.reset, title: 'perk.returns', text: 'perk.returnsText' },
  ];

  protected readonly responsive = [
    { breakpoint: '1280px', numVisible: 3, numScroll: 1 },
    { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
    { breakpoint: '640px', numVisible: 1, numScroll: 1 },
  ];
}
