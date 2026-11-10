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
  CONCENTRATIONS, Concentration, GENDERS, Gender, LONGEVITIES, Longevity, MAX_PHOTOS, Perfume, PerfumeInput, SEASONS, Season, TIMES_OF_DAY, TimeOfDay,
} from '../../../core/models';
import { ProductService } from '../../../core/product.service';
import { Bottle } from '../../../shared/bottle/bottle';
import { Icons } from '../../../shared/icons';
import { PhotoManager } from '../../../shared/photo-manager/photo-manager';
import { WearGuide } from '../../../shared/wear-guide/wear-guide';
import { SEASON_ICONS } from '../../../shared/wear-icons';

const splitNotes = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

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
  protected readonly rows = computed(() =>
    this.products.products().map((p) => ({
      ...p,
      brandName: this.catalog.brandName(p.brandId),
      categoryName: this.catalog.categoryName(p.categoryId, this.i18n.lang()),
    })),
  );

  protected readonly dialogOpen = signal(false);
  protected readonly editing = signal<Perfume | null>(null);
  protected readonly images = signal<string[]>([]);
  /** Photos uploaded while the dialog is open; deleted again if not kept. */
  protected uploadedThisSession: string[] = [];
  private saved = false;

  protected readonly genderOptions = computed(() => GENDERS.map((v) => ({ value: v, label: this.i18n.tv('gender', v) })));
  protected readonly catalog = inject(CatalogService);
  protected readonly categoryOptions = computed(() =>
    this.catalog.categories().map((c) => ({ value: c.id, label: c.name[this.i18n.lang()] || c.name.en })),
  );
  protected readonly seasonList = SEASONS;
  protected readonly seasonIcons = SEASON_ICONS;
  protected readonly longevityOptions = computed(() => LONGEVITIES.map((v) => ({ value: v, label: this.i18n.tv('longevity', v) })));
  protected readonly timeOptions = computed(() => TIMES_OF_DAY.map((v) => ({ value: v, label: this.i18n.tv('time', v) })));
  protected readonly concentrationOptions = computed(() => CONCENTRATIONS.map((v) => ({ value: v, label: this.i18n.tv('conc', v) })));

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    brandId: this.fb.control<number | null>(null, Validators.required),
    description: ['', Validators.required],
    price: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    oldPrice: this.fb.control<number | null>(null),
    stock: [0, [Validators.required, Validators.min(0)]],
    volumeMl: [100, [Validators.required, Validators.min(1)]],
    gender: this.fb.control<Gender>('Unisex'),
    categoryId: this.fb.control<string | null>(null, Validators.required),
    concentration: this.fb.control<Concentration>('EDP'),
    longevity: this.fb.control<Longevity>('Moderate'),
    seasons: this.fb.control<Season[]>(['Spring', 'Summer', 'Autumn', 'Winter'], (c) => (c.value?.length ? null : { required: true })),
    timeOfDay: this.fb.control<TimeOfDay>('Both'),
    color: ['#d6b38a'],
    featured: [false],
    topNotes: [''],
    heartNotes: [''],
    baseNotes: [''],
  });

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
      ['ID', 'Name', 'Brand', 'Category', 'Gender', 'Concentration', 'Volume (ml)', 'Price (USD)', 'Compare-at (USD)', 'Stock',
       'Longevity', 'Seasons', 'Day/Night', 'Featured', 'Photos', 'Created'],
      this.rows().map((p) => [
        p.id, p.name, p.brandName, this.catalog.categoryName(p.categoryId, 'en'), p.gender, p.concentration, p.volumeMl, p.price,
        p.oldPrice ?? '', p.stock, p.longevity, p.seasons.join(' / '), p.timeOfDay, p.featured ? 'yes' : 'no', p.images.length, p.createdAt.slice(0, 10),
      ]),
    );
  }

  filter(dt: Table, e: Event): void {
    dt.filterGlobal((e.target as HTMLInputElement).value, 'contains');
  }

  bad(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && c.touched;
  }

  private open(p: Perfume | null): void {
    this.editing.set(p);
    this.images.set(p ? [...p.images].slice(0, MAX_PHOTOS) : []);
    this.uploadedThisSession = [];
    this.saved = false;
    this.dialogOpen.set(true);
  }

  openNew(): void {
    this.form.reset();
    this.open(null);
  }

  openEdit(p: Perfume): void {
    this.form.reset({
      ...p,
      oldPrice: p.oldPrice ?? null,
      seasons: [...p.seasons],
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
    const input: PerfumeInput = {
      ...v,
      brandId: v.brandId!,
      categoryId: v.categoryId!,
      price: v.price ?? 0,
      oldPrice: v.oldPrice || null,
      images: this.images(),
      topNotes: splitNotes(v.topNotes),
      heartNotes: splitNotes(v.heartNotes),
      baseNotes: splitNotes(v.baseNotes),
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

  remove(p: Perfume): void {
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
