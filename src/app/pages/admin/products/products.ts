import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { I18nService } from '../../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../../core/i18n/pipes';
import { ImageStore } from '../../../core/image-store.service';
import { CatalogService } from '../../../core/catalog.service';
import { downloadCsv } from '../../../core/csv';
import {
  CONCENTRATIONS, Concentration, DECANT_SIZES, GENDERS, Gender, LONGEVITIES, Longevity, MAX_PHOTOS, PACKAGINGS, Packaging, Product, ProductInput, ProductKind,
  Variant, variantId,
  SEASONS, Season, SizeUnit, SKIN_TYPES, SkinType, TIMES_OF_DAY, TimeOfDay,
} from '../../../core/models';
import { ProductService } from '../../../core/product.service';
import { Bottle } from '../../../shared/bottle/bottle';
import { Icons } from '../../../shared/icons';
import { PhotoManager } from '../../../shared/photo-manager/photo-manager';
import { WearGuide } from '../../../shared/wear-guide/wear-guide';
import { SEASON_ICONS } from '../../../shared/wear-icons';

const splitNotes = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

interface SizeRow {
  size: number | null;
  unit: SizeUnit;
  price: number | null;
  oldPrice: number | null;
  stock: number | null;
}

interface DecantRow {
  size: number;
  enabled: boolean;
  price: number | null;
  stock: number | null;
}

@Component({
  selector: 'app-admin-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, ReactiveFormsModule, FaIconComponent, ButtonModule, DialogModule, IconFieldModule, InputIconModule, InputNumberModule,
    InputTextModule, SelectModule, TableModule, TagModule, TextareaModule, ToggleSwitchModule, TooltipModule, Bottle, PhotoManager, WearGuide, SelectButtonModule, ...I18N_PIPES,
  ],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class AdminProducts {
  protected readonly products = inject(ProductService);
  protected readonly i18n = inject(I18nService);
  private readonly imageStore = inject(ImageStore);
  private readonly confirm = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly i = Icons;

  /** Table rows with resolved names so search and sorting work on what the admin sees. */
  protected readonly tableKind = signal<ProductKind | null>(null);
  protected readonly rows = computed(() =>
    this.products.products().filter((p) => !this.tableKind() || p.kind === this.tableKind()).map((p) => ({
      ...p,
      brandName: this.catalog.brandName(p.brandId),
      categoryName: this.catalog.categoryName(p.categoryId, this.i18n.lang()),
    })),
  );

  /** Current product type in the form (drives the category list and visible fields) */
  protected readonly kind = signal<ProductKind>('perfume');

  protected readonly dialogOpen = signal(false);
  protected readonly editing = signal<Product | null>(null);
  protected readonly images = signal<string[]>([]);
  /** Photos uploaded while the dialog is open; deleted again if not kept. */
  protected uploadedThisSession: string[] = [];
  private saved = false;

  protected readonly genderOptions = computed(() => GENDERS.map((v) => ({ value: v, label: this.i18n.tv('gender', v) })));
  protected readonly catalog = inject(CatalogService);
  protected readonly categoryOptions = computed(() =>
    this.catalog.categoriesOf(this.kind()).map((c) => ({ value: c.id, label: c.name[this.i18n.lang()] || c.name.en })),
  );
  protected readonly kindOptions = computed(() => [
    { value: 'perfume', label: this.i18n.t('kind.perfume') },
    { value: 'cosmetic', label: this.i18n.t('kind.cosmetic') },
  ]);
  protected readonly packagingOptions = computed(() => PACKAGINGS.map((v) => ({ value: v, label: this.i18n.tv('pack', v) })));
  protected readonly unitOptions: SizeUnit[] = ['ml', 'g'];
  protected readonly skinList = SKIN_TYPES;
  protected readonly seasonList = SEASONS;
  protected readonly seasonIcons = SEASON_ICONS;
  protected readonly longevityOptions = computed(() => LONGEVITIES.map((v) => ({ value: v, label: this.i18n.tv('longevity', v) })));
  protected readonly timeOptions = computed(() => TIMES_OF_DAY.map((v) => ({ value: v, label: this.i18n.tv('time', v) })));
  protected readonly concentrationOptions = computed(() => CONCENTRATIONS.map((v) => ({ value: v, label: this.i18n.tv('conc', v) })));

  protected readonly form = this.fb.group({
    kind: this.fb.control<ProductKind>('perfume'),
    name: ['', Validators.required],
    brandId: this.fb.control<number | null>(null, Validators.required),
    description: ['', Validators.required],
    gender: this.fb.control<Gender>('Unisex'),
    categoryId: this.fb.control<string | null>(null, Validators.required),
    concentration: this.fb.control<Concentration>('EDP'),
    longevity: this.fb.control<Longevity>('Moderate'),
    seasons: this.fb.control<Season[]>(['Spring', 'Summer', 'Autumn', 'Winter'], (c) => (c.value?.length ? null : { required: true })),
    timeOfDay: this.fb.control<TimeOfDay>('Both'),
    packaging: this.fb.control<Packaging>('jar'),
    skinTypes: this.fb.control<SkinType[]>(['All']),
    ingredients: [''],
    howToUse: [''],
    color: ['#d6b38a'],
    featured: [false],
    topNotes: [''],
    heartNotes: [''],
    baseNotes: [''],
  });

  protected hasDecants(p: Product): boolean {
    return p.variants.some((v) => v.type === 'decant');
  }

  toggleSkin(skin: SkinType): void {
    const c = this.form.controls.skinTypes;
    c.setValue(SKIN_TYPES.filter((s) => (s === skin ? !c.value.includes(s) : c.value.includes(s))));
  }

  toggleSeason(season: Season): void {
    const c = this.form.controls.seasons;
    const current = c.value ?? [];
    // keep seasons in calendar order
    c.setValue(SEASONS.filter((s) => (s === season ? !current.includes(s) : current.includes(s))));
    c.markAsTouched();
  }

  exportCsv(): void {
    downloadCsv(
      `products-${new Date().toISOString().slice(0, 10)}.csv`,
      ['ID', 'Type', 'Name', 'Brand', 'Category', 'Gender', 'Concentration', 'Sizes: size price (stock)', 'Unit', 'From (USD)', 'Compare-at (USD)', 'Total stock',
       'Longevity', 'Seasons', 'Day/Night', 'Skin types', 'Ingredients', 'Featured', 'Photos', 'Created'],
      this.rows().map((p) => [
        p.id, p.kind, p.name, p.brandName, this.catalog.categoryName(p.categoryId, 'en'), p.gender, p.kind === 'perfume' ? p.concentration : '',
        p.variants.map((v) => `${v.size}${v.unit}${v.type === 'decant' ? ' decant' : ''} $${v.price} (${v.stock})`).join(' | '), p.unit, p.price, p.oldPrice ?? '', p.stock,
        ...(p.kind === 'perfume' ? [p.longevity, p.seasons.join(' / '), p.timeOfDay, '', ''] : ['', '', '', p.skinTypes.join(' / '), p.ingredients.join(' / ')]),
        p.featured ? 'yes' : 'no', p.images.length, p.createdAt.slice(0, 10),
      ]),
    );
  }

  constructor() {
    this.form.controls.kind.valueChanges.subscribe((kind) => {
      this.kind.set(kind);
      const cat = this.form.controls.categoryId.value;
      if (cat && this.catalog.category(cat)?.kind !== kind) this.form.controls.categoryId.setValue(null);
      // seasons are only required for perfumes
      const seasons = this.form.controls.seasons;
      if (kind === 'cosmetic') {
        seasons.clearValidators();
      } else seasons.setValidators((c) => (c.value?.length ? null : { required: true }));
      seasons.updateValueAndValidity();
    });
  }

  filter(dt: Table, e: Event): void {
    dt.filterGlobal((e.target as HTMLInputElement).value, 'contains');
  }

  bad(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && c.touched;
  }

  // ---- Sizes editor ----
  /** Full sizes (any number, customizable) */
  protected bottleRows: SizeRow[] = [];
  /** The fixed decant sizes, each can be switched on with its own price and stock (perfumes only) */
  protected decantRows: DecantRow[] = [];
  protected readonly sizesError = signal('');

  private loadSizes(p: Product | null, kind: ProductKind): void {
    const bottles = p?.variants.filter((v) => v.type === 'bottle') ?? [];
    this.bottleRows = bottles.length
      ? bottles.map((v) => ({ size: v.size, unit: v.unit, price: v.price, oldPrice: v.oldPrice ?? null, stock: v.stock }))
      : [{ size: kind === 'perfume' ? 100 : 50, unit: 'ml', price: null, oldPrice: null, stock: 10 }];
    this.decantRows = DECANT_SIZES.map((size) => {
      const v = p?.variants.find((x) => x.type === 'decant' && x.size === size);
      return { size, enabled: !!v, price: v?.price ?? null, stock: v?.stock ?? 20 };
    });
    this.sizesError.set('');
  }

  addSizeRow(): void {
    const last = this.bottleRows.at(-1);
    this.bottleRows = [...this.bottleRows, { size: null, unit: last?.unit ?? 'ml', price: null, oldPrice: null, stock: 10 }];
  }

  removeSizeRow(index: number): void {
    this.bottleRows = this.bottleRows.filter((_, i) => i !== index);
  }

  /** Decant price = bottle price per ml × size × 1.4 (pouring + atomiser) + 2, rounded, min 5. */
  suggestDecantPrices(): void {
    const ref = [...this.bottleRows].filter((r) => r.size && r.price && r.unit === 'ml').sort((a, b) => b.size! - a.size!)[0];
    if (!ref) return;
    const perMl = ref.price! / ref.size!;
    this.decantRows = this.decantRows.map((d) => ({ ...d, price: Math.max(5, Math.round(perMl * d.size * 1.4 + 2)) }));
  }

  /** Builds the variants from the editor, or returns null (and shows why) when they are invalid. */
  private buildVariants(kind: ProductKind): Variant[] | null {
    const variants: Variant[] = this.bottleRows
      .filter((r) => r.size || r.price)
      .map((r) => {
        const unit: SizeUnit = kind === 'perfume' ? 'ml' : r.unit;
        return { id: variantId({ type: 'bottle', size: r.size ?? 0, unit }), type: 'bottle' as const, size: r.size ?? 0, unit, price: r.price ?? 0, oldPrice: r.oldPrice || null, stock: Math.max(0, r.stock ?? 0) };
      });
    if (kind === 'perfume') {
      for (const d of this.decantRows.filter((x) => x.enabled)) {
        variants.push({ id: variantId({ type: 'decant', size: d.size, unit: 'ml' }), type: 'decant', size: d.size, unit: 'ml', price: d.price ?? 0, oldPrice: null, stock: Math.max(0, d.stock ?? 0) });
      }
    }
    if (!variants.length || variants.some((v) => !(v.size > 0) || !(v.price > 0))) {
      this.sizesError.set(this.i18n.t('ap.sizesRequired'));
      return null;
    }
    if (new Set(variants.map((v) => v.id)).size !== variants.length) {
      this.sizesError.set(this.i18n.t('ap.duplicateSize'));
      return null;
    }
    this.sizesError.set('');
    return variants;
  }

  private open(p: Product | null): void {
    this.editing.set(p);
    this.loadSizes(p, this.form.controls.kind.value);
    this.images.set(p ? [...p.images].slice(0, MAX_PHOTOS) : []);
    this.uploadedThisSession = [];
    this.saved = false;
    this.dialogOpen.set(true);
  }

  openNew(kind: ProductKind = 'perfume'): void {
    this.form.reset();
    this.form.controls.kind.setValue(kind);
    this.open(null);
  }

  openEdit(p: Product): void {
    this.form.reset({
      ...p,
      seasons: [...p.seasons],
      skinTypes: [...p.skinTypes],
      ingredients: p.ingredients.join(', '),
      topNotes: p.topNotes.join(', '),
      heartNotes: p.heartNotes.join(', '),
      baseNotes: p.baseNotes.join(', '),
    });
    this.open(p);
  }

  /** Clean up uploads that ended up unused (dialog cancelled, or photo removed before saving). */
  onHide(): void {
    const kept = this.saved ? this.images() : [];
    this.imageStore.remove(this.uploadedThisSession.filter((ref) => !kept.includes(ref)));
    this.uploadedThisSession = [];
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.add({ severity: 'warn', summary: this.i18n.t('toast.fillRequired'), life: 2500 });
      return;
    }
    const v = this.form.getRawValue();
    const variants = this.buildVariants(v.kind);
    if (!variants) return;
    const input: ProductInput = {
      ...v,
      variants,
      brandId: v.brandId!,
      categoryId: v.categoryId!,
      images: this.images(),
      topNotes: splitNotes(v.topNotes),
      heartNotes: splitNotes(v.heartNotes),
      baseNotes: splitNotes(v.baseNotes),
      ingredients: splitNotes(v.ingredients),
    };
    const current = this.editing();
    if (current) {
      this.products.update(current.id, input);
      this.toast.add({ severity: 'success', summary: this.i18n.t('toast.perfumeUpdated'), detail: input.name, life: 2500 });
    } else {
      this.products.create(input);
      this.toast.add({ severity: 'success', summary: this.i18n.t('toast.perfumeCreated'), detail: input.name, life: 2500 });
    }
    this.saved = true;
    this.dialogOpen.set(false);
  }

  remove(p: Product): void {
    this.confirm.confirm({
      header: this.i18n.t('ap.deleteTitle'),
      message: this.i18n.t('ap.deleteMsg', { name: p.name }),
      acceptLabel: this.i18n.t('ap.deleteBtn'),
      rejectLabel: this.i18n.t('common.cancel'),
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.products.delete(p.id);
        this.toast.add({ severity: 'success', summary: this.i18n.t('toast.perfumeDeleted'), detail: p.name, life: 2500 });
      },
    });
  }
}
