import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
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
import { SelectButtonModule } from 'primeng/selectbutton';
import { SliderModule } from 'primeng/slider';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FAMILIES, Family, Gender, GENDERS } from '../../core/models';
import { ProductService } from '../../core/product.service';
import { Icons } from '../../shared/icons';
import { ProductCard } from '../../shared/product-card';
import { NgTemplateOutlet } from '@angular/common';

type SortKey = 'featured' | 'priceAsc' | 'priceDesc' | 'rating' | 'newest' | 'name';

@Component({
  selector: 'app-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, NgTemplateOutlet, FaIconComponent, ButtonModule, CheckboxModule, DrawerModule, IconFieldModule, InputIconModule,
    InputTextModule, MultiSelectModule, PaginatorModule, SelectModule, SelectButtonModule, SliderModule, ToggleSwitchModule, ProductCard,
  ],
  template: `
    <div class="border-b border-stone-200 bg-white">
      <div class="container-x py-10">
        <h1 class="text-4xl font-bold">{{ title() }}</h1>
        <p class="mt-2 text-stone-500">{{ filtered().length }} fragrances</p>
      </div>
    </div>

    <ng-template #filtersTpl>
      <div class="flex flex-col gap-7">
        <div>
          <label class="field-label">Search</label>
          <p-iconfield>
            <p-inputicon><fa-icon [icon]="i.search" class="text-stone-400" /></p-inputicon>
            <input pInputText [(ngModel)]="search" placeholder="Name, brand or note" class="w-full" />
          </p-iconfield>
        </div>
        <div>
          <label class="field-label">For</label>
          <p-selectbutton [options]="genderOptions" [(ngModel)]="gender" optionLabel="label" optionValue="value"
                          [allowEmpty]="false" size="small" />
        </div>
        <div>
          <label class="field-label">Scent family</label>
          <div class="grid grid-cols-2 gap-2">
            @for (f of families; track f) {
              <label class="flex cursor-pointer items-center gap-2 text-sm">
                <p-checkbox [value]="f" [(ngModel)]="selectedFamilies" />{{ f }}
              </label>
            }
          </div>
        </div>
        <div>
          <label class="field-label">Brand</label>
          <p-multiselect [options]="products.brands()" [(ngModel)]="selectedBrands" placeholder="All brands" display="chip"
                         class="w-full" appendTo="body" [showToggleAll]="false" />
        </div>
        <div>
          <div class="mb-3 flex justify-between text-sm">
            <span class="font-medium text-stone-700">Price</span>
            <span class="text-stone-500">\${{ price()[0] }} – \${{ price()[1] }}</span>
          </div>
          <p-slider [(ngModel)]="price" [range]="true" [min]="0" [max]="products.maxPrice()" [step]="5" class="mx-2 block" />
        </div>
        <label class="flex items-center justify-between text-sm font-medium text-stone-700">
          In stock only <p-toggleswitch [(ngModel)]="inStockOnly" />
        </label>
        <p-button severity="secondary" [outlined]="true" (onClick)="resetFilters()" styleClass="w-full">
          <fa-icon [icon]="i.reset" /> Reset filters
        </p-button>
      </div>
    </ng-template>

    <p-drawer [(visible)]="filtersOpen" header="Filters" styleClass="!w-80">
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
            <fa-icon [icon]="i.filter" /> Filters
          </p-button>
          <div class="ml-auto flex items-center gap-2">
            <span class="hidden text-sm text-stone-500 sm:inline">Sort by</span>
            <p-select [options]="sortOptions" [(ngModel)]="sort" optionLabel="label" optionValue="value" class="w-48" />
          </div>
        </div>

        @if (paged().length) {
          <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            @for (p of paged(); track p.id) {
              <app-product-card [product]="p" />
            }
          </div>
          @if (filtered().length > rows()) {
            <p-paginator class="mt-8 block" [first]="first()" [rows]="rows()" [totalRecords]="filtered().length"
                         [rowsPerPageOptions]="[6, 9, 12, 24]" (onPageChange)="onPage($event)" />
          }
        } @else {
          <div class="card flex flex-col items-center py-20 text-center">
            <fa-icon [icon]="i.search" class="text-4xl text-stone-300" />
            <h3 class="mt-4 text-xl font-semibold">No fragrances match your filters</h3>
            <p class="mt-1 text-sm text-stone-500">Try widening your search or resetting the filters.</p>
            <p-button class="mt-6" (onClick)="resetFilters()">Reset filters</p-button>
          </div>
        }
      </section>
    </div>
  `,
})
export class Catalog {
  protected readonly products = inject(ProductService);
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

  protected readonly genderOptions = [
    { label: 'All', value: 'All' },
    ...GENDERS.map((g) => ({ label: g, value: g })),
  ];
  protected readonly sortOptions: { label: string; value: SortKey }[] = [
    { label: 'Featured', value: 'featured' },
    { label: 'Newest', value: 'newest' },
    { label: 'Price: low to high', value: 'priceAsc' },
    { label: 'Price: high to low', value: 'priceDesc' },
    { label: 'Top rated', value: 'rating' },
    { label: 'Name A–Z', value: 'name' },
  ];

  protected readonly title = computed(() => {
    const g = this.gender();
    const f = this.selectedFamilies();
    if (f.length === 1 && g === 'All') return `${f[0]} fragrances`;
    return g === 'All' ? 'All fragrances' : `Fragrances for ${g === 'Unisex' ? 'everyone' : g.toLowerCase()}`;
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
