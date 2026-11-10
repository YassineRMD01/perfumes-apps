import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DrawerModule } from 'primeng/drawer';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FAMILIES, Family, Gender, GENDERS } from '../../core/models';
import { I18nService } from '../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../core/i18n/pipes';
import { ProductService } from '../../core/product.service';
import { Icons } from '../../shared/icons';
import { ProductCard } from '../../shared/product-card';

type SortKey = 'featured' | 'priceAsc' | 'priceDesc' | 'rating' | 'newest' | 'name';

@Component({
  selector: 'app-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, NgTemplateOutlet, FaIconComponent, ButtonModule, CheckboxModule, DrawerModule, IconFieldModule, InputIconModule,
    InputTextModule, MultiSelectModule, PaginatorModule, SelectModule, SliderModule, ToggleSwitchModule, ProductCard, ...I18N_PIPES,
  ],
  template: `
    <div class="border-b border-stone-200 bg-white">
      <div class="container-x py-10">
        <h1 class="text-4xl font-bold">{{ title() }}</h1>
        <p class="mt-2 text-stone-500">{{ 'shop.count' | t: { n: filtered().length } }}</p>
      </div>
    </div>

    <ng-template #filtersTpl>
      <div class="flex flex-col gap-7">
        <div>
          <label class="field-label">{{ 'shop.search' | t }}</label>
          <p-iconfield>
            <p-inputicon><fa-icon [icon]="i.search" class="text-stone-400" /></p-inputicon>
            <input pInputText [(ngModel)]="search" [placeholder]="'shop.searchPlaceholder' | t" class="w-full" />
          </p-iconfield>
        </div>
        <div>
          <label class="field-label">{{ 'shop.for' | t }}</label>
          <div class="flex flex-wrap gap-2" role="radiogroup">
            @for (o of genderOptions(); track o.value) {
              <button type="button" role="radio" [attr.aria-checked]="gender() === o.value" (click)="gender.set(o.value)"
                      class="rounded-full border px-3 py-1 text-sm transition"
                      [class.border-amber-500]="gender() === o.value" [class.bg-amber-50]="gender() === o.value"
                      [class.text-amber-800]="gender() === o.value" [class.border-stone-200]="gender() !== o.value"
                      [class.hover:bg-stone-50]="gender() !== o.value">{{ o.label }}</button>
            }
          </div>
        </div>
        <div>
          <label class="field-label">{{ 'shop.family' | t }}</label>
          <div class="grid grid-cols-2 gap-2">
            @for (f of families; track f) {
              <label class="flex cursor-pointer items-center gap-2 text-sm">
                <p-checkbox [value]="f" [(ngModel)]="selectedFamilies" />{{ f | tv: 'family' }}
              </label>
            }
          </div>
        </div>
        <div>
          <label class="field-label">{{ 'shop.brand' | t }}</label>
          <p-multiselect [options]="products.brands()" [(ngModel)]="selectedBrands" [placeholder]="'shop.allBrands' | t" display="chip"
                         class="w-full" appendTo="body" [showToggleAll]="false" />
        </div>
        <div>
          <div class="mb-3 flex justify-between text-sm">
            <span class="font-medium text-stone-700">{{ 'shop.price' | t }}</span>
            <span class="text-stone-500" dir="ltr">{{ price()[0] | money: true }} – {{ price()[1] | money: true }}</span>
          </div>
          <p-slider dir="ltr" [(ngModel)]="price" [range]="true" [min]="0" [max]="products.maxPrice()" [step]="5" class="mx-2 block" />
        </div>
        <label class="flex items-center justify-between text-sm font-medium text-stone-700">
          {{ 'shop.inStock' | t }} <p-toggleswitch [(ngModel)]="inStockOnly" />
        </label>
        <p-button severity="secondary" [outlined]="true" (onClick)="resetFilters()" styleClass="w-full">
          <fa-icon [icon]="i.reset" /> {{ 'shop.reset' | t }}
        </p-button>
      </div>
    </ng-template>

    <p-drawer [(visible)]="filtersOpen" [header]="'shop.filters' | t" styleClass="!w-80" [position]="i18n.isRtl() ? 'right' : 'left'">
      <ng-container *ngTemplateOutlet="filtersTpl" />
    </p-drawer>

    <div class="container-x grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
      <aside class="hidden lg:block">
        <div class="card sticky top-24 p-5">
          <ng-container *ngTemplateOutlet="filtersTpl" />
        </div>
      </aside>

      <section>
        <div class="mb-6 flex items-center justify-between gap-3">
          <p-button class="lg:hidden" severity="secondary" [outlined]="true" (onClick)="filtersOpen.set(true)">
            <fa-icon [icon]="i.filter" /> {{ 'shop.filters' | t }}
          </p-button>
          <div class="ms-auto flex items-center gap-2">
            <span class="hidden text-sm text-stone-500 sm:inline">{{ 'shop.sortBy' | t }}</span>
            <p-select [options]="sortOptions()" [(ngModel)]="sort" optionLabel="label" optionValue="value" class="w-56" />
          </div>
        </div>

        @if (paged().length) {
          <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            @for (p of paged(); track p.id) {
              <app-product-card [product]="p" />
            }
          </div>
          @if (filtered().length > rows()) {
            <p-paginator class="mt-8 block" dir="ltr" [first]="first()" [rows]="rows()" [totalRecords]="filtered().length"
                         [rowsPerPageOptions]="[6, 9, 12, 24]" (onPageChange)="onPage($event)" />
          }
        } @else {
          <div class="card flex flex-col items-center py-20 text-center">
            <fa-icon [icon]="i.search" class="text-4xl text-stone-300" />
            <h3 class="mt-4 text-xl font-semibold">{{ 'shop.noResults' | t }}</h3>
            <p class="mt-1 text-sm text-stone-500">{{ 'shop.noResultsText' | t }}</p>
            <p-button class="mt-6" (onClick)="resetFilters()">{{ 'shop.reset' | t }}</p-button>
          </div>
        }
      </section>
    </div>
  `,
})
export class Catalog {
  protected readonly products = inject(ProductService);
  protected readonly i18n = inject(I18nService);
  protected readonly i = Icons;
  protected readonly families = FAMILIES;

  // Query params (bound via withComponentInputBinding)
  readonly q = input<string>();
  readonly genderParam = input<string>(undefined, { alias: 'gender' });
  readonly familyParam = input<string>(undefined, { alias: 'family' });

  protected readonly search = linkedSignal(() => this.q() ?? '');
  protected readonly gender = linkedSignal<Gender | 'All'>(() =>
    GENDERS.includes(this.genderParam() as Gender) ? (this.genderParam() as Gender) : 'All',
  );
  protected readonly selectedFamilies = linkedSignal<Family[]>(() =>
    FAMILIES.includes(this.familyParam() as Family) ? [this.familyParam() as Family] : [],
  );
  protected readonly selectedBrands = signal<string[]>([]);
  protected readonly price = linkedSignal<number[]>(() => [0, this.products.maxPrice()]);
  protected readonly inStockOnly = signal(false);
  protected readonly sort = signal<SortKey>('featured');
  protected readonly first = signal(0);
  protected readonly rows = signal(9);
  protected readonly filtersOpen = signal(false);

  protected readonly genderOptions = computed(() => [
    { label: this.i18n.t('shop.all'), value: 'All' as Gender | 'All' },
    ...GENDERS.map((g) => ({ label: this.i18n.tv('gender', g), value: g as Gender | 'All' })),
  ]);
  protected readonly sortOptions = computed(() =>
    (['featured', 'newest', 'priceAsc', 'priceDesc', 'rating', 'name'] as SortKey[]).map((value) => ({
      label: this.i18n.tv('sort', value),
      value,
    })),
  );

  protected readonly title = computed(() => {
    const g = this.gender();
    const f = this.selectedFamilies();
    if (f.length === 1 && g === 'All') return this.i18n.t('shop.titleFamily', { family: this.i18n.tv('family', f[0]) });
    if (g === 'All') return this.i18n.t('shop.titleAll');
    return this.i18n.t(g === 'Women' ? 'shop.titleWomen' : g === 'Men' ? 'shop.titleMen' : 'shop.titleUnisex');
  });

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const gender = this.gender();
    const fams = this.selectedFamilies();
    const brands = this.selectedBrands();
    const [min, max] = this.price();
    const list = this.products.products().filter(
      (p) =>
        (!term ||
          [p.name, p.brand, p.family, ...p.topNotes, ...p.heartNotes, ...p.baseNotes].some((s) => s.toLowerCase().includes(term))) &&
        (gender === 'All' || p.gender === gender) &&
        (!fams.length || fams.includes(p.family)) &&
        (!brands.length || brands.includes(p.brand)) &&
        p.price >= min && p.price <= max &&
        (!this.inStockOnly() || p.stock > 0),
    );
    const sorters: Record<SortKey, (a: typeof list[0], b: typeof list[0]) => number> = {
      featured: (a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating,
      newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
      priceAsc: (a, b) => a.price - b.price,
      priceDesc: (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return [...list].sort(sorters[this.sort()]);
  });

  protected readonly paged = computed(() => this.filtered().slice(this.first(), this.first() + this.rows()));

  constructor() {
    // Go back to page 1 whenever the result set changes
    effect(() => {
      this.filtered();
      this.first.set(0);
    });
  }

  onPage(e: PaginatorState): void {
    this.first.set(e.first ?? 0);
    this.rows.set(e.rows ?? 9);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetFilters(): void {
    this.search.set('');
    this.gender.set('All');
    this.selectedFamilies.set([]);
    this.selectedBrands.set([]);
    this.price.set([0, this.products.maxPrice()]);
    this.inStockOnly.set(false);
    this.sort.set('featured');
  }
}
