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
import { CatalogService } from '../../../core/catalog.service';
import { Gender, GENDERS, LONGEVITIES, Longevity, PRODUCT_KINDS, ProductKind, Season, SEASONS, SKIN_TYPES, SkinType, TimeOfDay } from '../../../core/models';
import { SEASON_ICONS, TIME_ICONS } from '../../../shared/wear-icons';
import { I18nService } from '../../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../../core/i18n/pipes';
import { ProductService } from '../../../core/product.service';
import { Icons } from '../../../shared/icons';
import { ProductCard } from '../../../shared/product-card/product-card';

type SortKey = 'featured' | 'priceAsc' | 'priceDesc' | 'rating' | 'newest' | 'name' | 'longevity';

@Component({
  selector: 'app-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, NgTemplateOutlet, FaIconComponent, ButtonModule, CheckboxModule, DrawerModule, IconFieldModule, InputIconModule,
    InputTextModule, MultiSelectModule, PaginatorModule, SelectModule, SliderModule, ToggleSwitchModule, ProductCard, ...I18N_PIPES,
  ],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class Catalog {
  protected readonly products = inject(ProductService);
  protected readonly i18n = inject(I18nService);
  protected readonly i = Icons;
  protected readonly catalog = inject(CatalogService);

  // Query params (bound via withComponentInputBinding)
  readonly q = input<string>();
  readonly genderParam = input<string>(undefined, { alias: 'gender' });
  readonly categoryParam = input<string>(undefined, { alias: 'category' });
  readonly brandParam = input<string>(undefined, { alias: 'brand' });
  readonly kindParam = input<string>(undefined, { alias: 'kind' });

  protected readonly search = linkedSignal(() => this.q() ?? '');
  /** null = perfumes and cosmetics */
  protected readonly kind = linkedSignal<ProductKind | null>(() => {
    const k = this.kindParam() as ProductKind;
    if (PRODUCT_KINDS.includes(k)) return k;
    // a category link implies its type
    const c = this.categoryParam() ? this.catalog.category(this.categoryParam()!) : undefined;
    return c?.kind ?? null;
  });
  protected readonly kindOptions = computed(() => [
    { value: null as ProductKind | null, label: this.i18n.t('shop.all') },
    { value: 'perfume' as ProductKind | null, label: this.i18n.t('nav.perfumes') },
    { value: 'cosmetic' as ProductKind | null, label: this.i18n.t('nav.cosmetics') },
  ]);
  protected readonly visibleCategories = computed(() => this.catalog.categoriesOf(this.kind()));
  protected readonly skinTypes = SKIN_TYPES.filter((s) => s !== 'All');
  protected readonly selectedSkin = signal<SkinType[]>([]);
  protected readonly gender = linkedSignal<Gender | 'All'>(() =>
    GENDERS.includes(this.genderParam() as Gender) ? (this.genderParam() as Gender) : 'All',
  );
  protected readonly selectedCategories = linkedSignal<string[]>(() => {
    const id = this.categoryParam();
    return id && this.catalog.category(id) ? [id] : [];
  });
  protected readonly selectedBrands = linkedSignal<number[]>(() => {
    const id = Number(this.brandParam());
    return id && this.catalog.brand(id) ? [id] : [];
  });
  protected readonly price = linkedSignal<number[]>(() => [0, this.products.maxPrice()]);
  protected readonly inStockOnly = signal(false);
  protected readonly selectedSeasons = signal<Season[]>([]);
  /** Day matches "Day" and "Both" perfumes, Night matches "Night" and "Both" */
  protected readonly time = signal<'All' | Exclude<TimeOfDay, 'Both'>>('All');
  protected readonly minLongevity = signal<Longevity | null>(null);
  protected readonly seasons = SEASONS;
  protected readonly seasonIcons = SEASON_ICONS;
  protected readonly timeIcons = TIME_ICONS;
  protected readonly longevityOptions = computed(() => [
    { value: null, label: this.i18n.t('shop.anyLongevity') },
    ...LONGEVITIES.slice(1).map((v) => ({ value: v as Longevity | null, label: this.i18n.tv('longevity', v) + ' +' })),
  ]);
  protected readonly sort = signal<SortKey>('featured');
  protected readonly first = signal(0);
  protected readonly rows = signal(9);
  protected readonly filtersOpen = signal(false);

  protected readonly genderOptions = computed(() => [
    { label: this.i18n.t('shop.all'), value: 'All' as Gender | 'All' },
    ...GENDERS.map((g) => ({ label: this.i18n.tv('gender', g), value: g as Gender | 'All' })),
  ]);
  protected readonly sortOptions = computed(() =>
    (['featured', 'newest', 'priceAsc', 'priceDesc', 'rating', 'longevity', 'name'] as SortKey[]).map((value) => ({
      label: this.i18n.tv('sort', value),
      value,
    })),
  );

  protected readonly title = computed(() => {
    const g = this.gender();
    const c = this.selectedCategories();
    const b = this.selectedBrands();
    if (b.length === 1 && !c.length && g === 'All') return this.catalog.brandName(b[0]);
    if (!c.length && g === 'All' && this.kind()) return this.i18n.t(this.kind() === 'perfume' ? 'shop.titlePerfumes' : 'shop.titleCosmetics');
    if (c.length === 1 && g === 'All') return this.i18n.t('shop.titleFamily', { family: this.catalog.categoryName(c[0], this.i18n.lang()) });
    if (g === 'All') return this.i18n.t('shop.titleAll');
    return this.i18n.t(g === 'Women' ? 'shop.titleWomen' : g === 'Men' ? 'shop.titleMen' : 'shop.titleUnisex');
  });

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const gender = this.gender();
    const cats = this.selectedCategories();
    const brands = this.selectedBrands();
    const [min, max] = this.price();
    const kind = this.kind();
    const skin = this.selectedSkin();
    const seasons = kind === 'perfume' ? this.selectedSeasons() : [];
    const time = kind === 'perfume' ? this.time() : 'All';
    const minLevel = kind === 'perfume' && this.minLongevity() ? LONGEVITIES.indexOf(this.minLongevity()!) : -1;
    const cosmeticOnly = kind === 'cosmetic' ? skin : [];
    const list = this.products.products().filter(
      (p) =>
        (!term ||
          [p.name, this.catalog.brandName(p.brandId), this.catalog.categoryName(p.categoryId, this.i18n.lang()), ...p.topNotes, ...p.heartNotes, ...p.baseNotes, ...p.ingredients]
            .some((s) => s.toLowerCase().includes(term))) &&
        (gender === 'All' || p.gender === gender) &&
        (!kind || p.kind === kind) &&
        (!cats.length || cats.includes(p.categoryId)) &&
        (!cosmeticOnly.length || p.skinTypes.includes('All') || cosmeticOnly.some((s) => p.skinTypes.includes(s))) &&
        (!brands.length || brands.includes(p.brandId)) &&
        p.price >= min && p.price <= max &&
        (!this.inStockOnly() || p.stock > 0) &&
        (!seasons.length || seasons.some((s) => p.seasons.includes(s))) &&
        (time === 'All' || p.timeOfDay === time || p.timeOfDay === 'Both') &&
        (minLevel < 0 || LONGEVITIES.indexOf(p.longevity) >= minLevel),
    );
    const sorters: Record<SortKey, (a: typeof list[0], b: typeof list[0]) => number> = {
      featured: (a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating,
      newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
      priceAsc: (a, b) => a.price - b.price,
      priceDesc: (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      name: (a, b) => a.name.localeCompare(b.name),
      longevity: (a, b) => LONGEVITIES.indexOf(b.longevity) - LONGEVITIES.indexOf(a.longevity),
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

  setKind(kind: ProductKind | null): void {
    this.kind.set(kind);
    // keep only categories that belong to the chosen type
    this.selectedCategories.update((ids) => ids.filter((id) => !kind || this.catalog.category(id)?.kind === kind));
  }

  toggleSkin(s: SkinType): void {
    this.selectedSkin.update((list) => (list.includes(s) ? list.filter((x) => x !== s) : [...list, s]));
  }

  toggleSeason(s: Season): void {
    this.selectedSeasons.update((list) => (list.includes(s) ? list.filter((x) => x !== s) : [...list, s]));
  }

  resetFilters(): void {
    this.search.set('');
    this.gender.set('All');
    this.selectedCategories.set([]);
    this.selectedBrands.set([]);
    this.price.set([0, this.products.maxPrice()]);
    this.inStockOnly.set(false);
    this.selectedSeasons.set([]);
    this.selectedSkin.set([]);
    this.time.set('All');
    this.minLongevity.set(null);
    this.sort.set('featured');
  }
}
