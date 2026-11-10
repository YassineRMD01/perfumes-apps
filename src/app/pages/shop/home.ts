import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { FAMILIES, Family } from '../../core/models';
import { ProductService } from '../../core/product.service';
import { Bottle } from '../../shared/bottle';
import { Icons } from '../../shared/icons';
import { ProductCard } from '../../shared/product-card';

const FAMILY_META: Record<Family, { color: string; blurb: string }> = {
  Floral: { color: 'from-pink-100 to-rose-200', blurb: 'Rose, jasmine, peony' },
  Woody: { color: 'from-amber-100 to-stone-300', blurb: 'Cedar, sandalwood, vetiver' },
  Oriental: { color: 'from-orange-100 to-red-200', blurb: 'Oud, amber, spices' },
  Fresh: { color: 'from-sky-100 to-emerald-200', blurb: 'Marine, green, aromatic' },
  Citrus: { color: 'from-yellow-100 to-lime-200', blurb: 'Lemon, bergamot, neroli' },
  Gourmand: { color: 'from-orange-50 to-amber-200', blurb: 'Vanilla, caramel, cocoa' },
};

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FaIconComponent, ButtonModule, CarouselModule, ProductCard, Bottle],
  template: `
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 text-white">
      <div class="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl"></div>
      <div class="container-x grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <div>
          <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-widest text-amber-300">
            <fa-icon [icon]="i.magic" /> New season collection
          </span>
          <h1 class="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Find the scent<br />that tells <em class="text-amber-400">your</em> story.
          </h1>
          <p class="mt-5 max-w-md text-stone-300">
            Hand-picked eaux de parfum and rare extraits from the world’s finest perfume houses.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <p-button routerLink="/shop" size="large">Shop the collection <fa-icon [icon]="i.arrowRight" /></p-button>
            <p-button routerLink="/shop" [queryParams]="{ family: 'Oriental' }" size="large" severity="secondary" [outlined]="true"
                      styleClass="!text-white !border-white/40 hover:!bg-white/10">Discover Oud</p-button>
          </div>
        </div>
        @if (hero; as h) {
          <a [routerLink]="['/product', h.id]" class="relative mx-auto flex h-80 w-64 items-center justify-center md:h-[26rem] md:w-80">
            <div class="absolute inset-6 rounded-full bg-amber-400/20 blur-2xl"></div>
            <app-bottle class="relative h-full" [color]="h.color" [name]="h.name" [brand]="h.brand" [imageUrl]="h.imageUrl" />
          </a>
        }
      </div>
    </section>

    <!-- Perks -->
    <section class="border-b border-stone-200 bg-white">
      <div class="container-x grid grid-cols-2 gap-6 py-6 text-sm md:grid-cols-4">
        @for (perk of perks; track perk.title) {
          <div class="flex items-center gap-3">
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-700"><fa-icon [icon]="perk.icon" /></span>
            <div><div class="font-semibold">{{ perk.title }}</div><div class="text-xs text-stone-500">{{ perk.text }}</div></div>
          </div>
        }
      </div>
    </section>

    <!-- Featured -->
    <section class="container-x py-16">
      <div class="mb-8 flex items-end justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-amber-700">Bestsellers</p>
          <h2 class="text-3xl font-bold">Featured fragrances</h2>
        </div>
        <a routerLink="/shop" class="nav-link hidden sm:inline">View all <fa-icon [icon]="i.arrowRight" /></a>
      </div>
      <p-carousel [value]="products.featured()" [numVisible]="4" [numScroll]="1" [circular]="true" [autoplayInterval]="5000"
                  [responsiveOptions]="responsive" [showIndicators]="false">
        <ng-template #item let-p>
          <div class="h-full p-2"><app-product-card [product]="p" /></div>
        </ng-template>
      </p-carousel>
    </section>

    <!-- Families -->
    <section class="bg-white py-16">
      <div class="container-x">
        <p class="text-xs font-semibold uppercase tracking-widest text-amber-700">Olfactory families</p>
        <h2 class="mb-8 text-3xl font-bold">Shop by scent</h2>
        <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          @for (f of families; track f) {
            <a routerLink="/shop" [queryParams]="{ family: f }"
               class="group rounded-2xl bg-gradient-to-br p-5 transition hover:-translate-y-1 hover:shadow-lg {{ meta[f].color }}">
              <fa-icon [icon]="i.drop" class="text-2xl text-stone-700/70" />
              <div class="font-display mt-6 text-xl font-semibold">{{ f }}</div>
              <div class="text-xs text-stone-600">{{ meta[f].blurb }}</div>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- New arrivals -->
    <section class="container-x py-16">
      <p class="text-xs font-semibold uppercase tracking-widest text-amber-700">Just landed</p>
      <h2 class="mb-8 text-3xl font-bold">New arrivals</h2>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        @for (p of products.newArrivals(); track p.id) {
          <app-product-card [product]="p" />
        }
      </div>
    </section>

    <!-- Newsletter -->
    <section class="container-x">
      <div class="rounded-3xl bg-gradient-to-r from-amber-600 to-amber-800 px-6 py-12 text-center text-white sm:px-12">
        <h2 class="text-3xl font-bold">Get 10% off your first order</h2>
        <p class="mt-2 text-amber-100">Join our newsletter for exclusive launches and private sales.</p>
        <form class="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row" (submit)="$event.preventDefault()">
          <input type="email" placeholder="your@email.com" class="flex-1 rounded-full px-5 py-3 text-stone-800 outline-none bg-white" />
          <button class="rounded-full bg-stone-900 px-6 py-3 font-semibold hover:bg-stone-800">Subscribe</button>
        </form>
      </div>
    </section>
  `,
})
export class Home {
  protected readonly products = inject(ProductService);
  protected readonly i = Icons;
  protected readonly families = FAMILIES;
  protected readonly meta = FAMILY_META;
  protected readonly hero = this.products.featured()[0] ?? this.products.products()[0];

  protected readonly perks = [
    { icon: Icons.truck, title: 'Free delivery', text: 'On orders over $150' },
    { icon: Icons.shield, title: '100% authentic', text: 'Sourced from the houses' },
    { icon: Icons.gem, title: 'Free samples', text: 'With every order' },
    { icon: Icons.reset, title: '30-day returns', text: 'Unopened products' },
  ];

  protected readonly responsive = [
    { breakpoint: '1280px', numVisible: 3, numScroll: 1 },
    { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
    { breakpoint: '640px', numVisible: 1, numScroll: 1 },
  ];
}
