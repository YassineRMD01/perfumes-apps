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
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { I18nService } from '../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../core/i18n/pipes';
import { ImageStore } from '../../core/image-store.service';
import { CONCENTRATIONS, Concentration, FAMILIES, Family, GENDERS, Gender, MAX_PHOTOS, Perfume, PerfumeInput } from '../../core/models';
import { ProductService } from '../../core/product.service';
import { Bottle } from '../../shared/bottle';
import { Icons } from '../../shared/icons';
import { PhotoManager } from '../../shared/photo-manager';

const splitNotes = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

@Component({
  selector: 'app-admin-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, ReactiveFormsModule, FaIconComponent, ButtonModule, DialogModule, IconFieldModule, InputIconModule, InputNumberModule,
    InputTextModule, SelectModule, TableModule, TagModule, TextareaModule, ToggleSwitchModule, TooltipModule, Bottle, PhotoManager, ...I18N_PIPES,
  ],
  template: `
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-3xl font-bold">{{ 'ap.title' | t }}</h2>
        <p class="text-sm text-stone-500">{{ 'ap.count' | t: { n: products.products().length } }}</p>
      </div>
      <p-button (onClick)="openNew()"><fa-icon [icon]="i.plus" /> {{ 'ap.new' | t }}</p-button>
    </div>

    <div class="card overflow-hidden">
      <p-table #dt [value]="products.products()" dataKey="id" [paginator]="true" [rows]="8" [rowsPerPageOptions]="[8, 16, 32]"
               [globalFilterFields]="['name', 'brand', 'family', 'gender']" [tableStyle]="{ 'min-width': '60rem' }"
               sortField="createdAt" [sortOrder]="-1" [rowHover]="true">
        <ng-template #caption>
          <p-iconfield>
            <p-inputicon><fa-icon [icon]="i.search" class="text-stone-400" /></p-inputicon>
            <input pInputText [placeholder]="'ap.search' | t" (input)="filter(dt, $event)" />
          </p-iconfield>
        </ng-template>
        <ng-template #header>
          <tr>
            <th class="w-20"></th>
            <th pSortableColumn="name">{{ 'ap.colPerfume' | t }} <p-sortIcon field="name" /></th>
            <th pSortableColumn="family">{{ 'ap.colFamily' | t }} <p-sortIcon field="family" /></th>
            <th pSortableColumn="gender">{{ 'ap.colFor' | t }} <p-sortIcon field="gender" /></th>
            <th pSortableColumn="price">{{ 'ap.colPrice' | t }} <p-sortIcon field="price" /></th>
            <th pSortableColumn="stock">{{ 'ap.colStock' | t }} <p-sortIcon field="stock" /></th>
            <th>{{ 'ap.colFeatured' | t }}</th>
            <th class="w-28 text-end">{{ 'ap.colActions' | t }}</th>
          </tr>
        </ng-template>
        <ng-template #body let-p>
          <tr>
            <td>
              <div class="relative h-14 w-12 overflow-hidden rounded-lg bg-stone-100" [class.p-1]="!p.images.length">
                <app-bottle class="h-full w-full" [color]="p.color" [name]="p.name" [image]="p.images[0]" fit="cover" />
                @if (p.images.length > 1) {
                  <span class="absolute bottom-0.5 end-0.5 rounded bg-black/65 px-1 text-[9px] font-semibold text-white"
                        [pTooltip]="'ap.photosCount' | t: { n: p.images.length }">{{ p.images.length }}</span>
                }
              </div>
            </td>
            <td>
              <div class="font-medium">{{ p.name }}</div>
              <div class="text-xs text-stone-500">{{ p.brand }} · {{ p.concentration }} {{ p.volumeMl }}ml</div>
            </td>
            <td>{{ p.family | tv: 'family' }}</td>
            <td>{{ p.gender | tv: 'gender' }}</td>
            <td>
              {{ p.price | money }}
              @if (p.oldPrice) { <div class="text-xs text-stone-400 line-through">{{ p.oldPrice | money }}</div> }
            </td>
            <td>
              <p-tag [value]="p.stock === 0 ? ('ap.outOfStock' | t) : ('ap.units' | t: { n: p.stock })"
                     [severity]="p.stock === 0 ? 'danger' : p.stock <= 5 ? 'warn' : 'success'" />
            </td>
            <td>@if (p.featured) { <fa-icon [icon]="i.star" class="text-amber-500" /> } @else { <span class="text-stone-300">—</span> }</td>
            <td class="whitespace-nowrap text-end">
              <p-button [text]="true" [rounded]="true" severity="secondary" [pTooltip]="'ap.edit' | t" [ariaLabel]="'ap.edit' | t" (onClick)="openEdit(p)"><fa-icon [icon]="i.edit" /></p-button>
              <p-button [text]="true" [rounded]="true" severity="danger" [pTooltip]="'ap.delete' | t" [ariaLabel]="'ap.delete' | t" (onClick)="remove(p)"><fa-icon [icon]="i.trash" /></p-button>
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr><td colspan="8" class="py-10 text-center text-stone-500">{{ 'ap.empty' | t }}</td></tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [(visible)]="dialogOpen" [modal]="true" [header]="(editing() ? 'ap.editTitle' : 'ap.newTitle') | t" (onHide)="onHide()"
              [style]="{ width: '60rem' }" [breakpoints]="{ '1024px': '95vw' }" [draggable]="false">
      <form [formGroup]="form" (ngSubmit)="save()" id="productForm" class="grid gap-6 md:grid-cols-[200px_1fr]">
        <div class="flex flex-col gap-3">
          <div class="flex h-56 w-full items-center justify-center overflow-hidden rounded-xl bg-stone-100" [class.p-4]="!images().length">
            <app-bottle class="h-full w-full" [color]="form.controls.color.value" [name]="form.controls.name.value || ('ap.name' | t)"
                        [brand]="form.controls.brand.value" [image]="images()[0]" fit="cover" />
          </div>
          <label class="flex w-full items-center justify-between gap-2 text-sm">
            {{ 'ap.bottleColor' | t }}
            <input type="color" formControlName="color" class="h-8 w-12 cursor-pointer rounded border border-stone-300" />
          </label>
          <p class="-mt-2 text-xs text-stone-400">{{ 'ap.bottleHint' | t }}</p>
          <label class="flex w-full items-center justify-between text-sm">{{ 'ap.featured' | t }} <p-toggleswitch formControlName="featured" /></label>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <app-photo-manager [(images)]="images" (uploaded)="uploadedThisSession.push($event)" />
          </div>
          <div><label class="field-label">{{ 'ap.name' | t }} *</label><input pInputText formControlName="name" class="w-full" [invalid]="bad('name')" /></div>
          <div><label class="field-label">{{ 'ap.brand' | t }} *</label><input pInputText formControlName="brand" class="w-full" [invalid]="bad('brand')" /></div>
          <div class="sm:col-span-2"><label class="field-label">{{ 'ap.description' | t }} *</label><textarea pTextarea formControlName="description" rows="3" class="w-full" [invalid]="bad('description')"></textarea></div>
          <div><label class="field-label">{{ 'ap.price' | t }} *</label><p-inputnumber formControlName="price" mode="currency" currency="USD" [locale]="i18n.locale()" [fluid]="true" [invalid]="bad('price')" /></div>
          <div><label class="field-label">{{ 'ap.oldPrice' | t }}</label><p-inputnumber formControlName="oldPrice" mode="currency" currency="USD" [locale]="i18n.locale()" [fluid]="true" /></div>
          <div><label class="field-label">{{ 'ap.stock' | t }} *</label><p-inputnumber formControlName="stock" [min]="0" [showButtons]="true" [fluid]="true" /></div>
          <div><label class="field-label">{{ 'ap.volume' | t }} *</label><p-inputnumber formControlName="volumeMl" [min]="1" suffix=" ml" [fluid]="true" /></div>
          <div><label class="field-label">{{ 'ap.gender' | t }}</label><p-select [options]="genderOptions()" optionLabel="label" optionValue="value" formControlName="gender" class="w-full" appendTo="body" /></div>
          <div><label class="field-label">{{ 'ap.family' | t }}</label><p-select [options]="familyOptions()" optionLabel="label" optionValue="value" formControlName="family" class="w-full" appendTo="body" /></div>
          <div class="sm:col-span-2"><label class="field-label">{{ 'ap.concentration' | t }}</label><p-select [options]="concentrationOptions()" optionLabel="label" optionValue="value" formControlName="concentration" class="w-full" appendTo="body" /></div>
          <div class="grid gap-4 sm:col-span-2 sm:grid-cols-3">
            <div><label class="field-label">{{ 'ap.topNotes' | t }}</label><input pInputText formControlName="topNotes" class="w-full" [placeholder]="'ap.notesHint' | t" /></div>
            <div><label class="field-label">{{ 'ap.heartNotes' | t }}</label><input pInputText formControlName="heartNotes" class="w-full" [placeholder]="'ap.notesHint' | t" /></div>
            <div><label class="field-label">{{ 'ap.baseNotes' | t }}</label><input pInputText formControlName="baseNotes" class="w-full" [placeholder]="'ap.notesHint' | t" /></div>
          </div>
        </div>
      </form>
      <ng-template #footer>
        <p-button severity="secondary" [text]="true" (onClick)="dialogOpen.set(false)">{{ 'common.cancel' | t }}</p-button>
        <p-button (onClick)="save()"><fa-icon [icon]="i.check" /> {{ (editing() ? 'ap.save' : 'ap.create') | t }}</p-button>
      </ng-template>
    </p-dialog>
  `,
})
export class AdminProducts {
  protected readonly products = inject(ProductService);
  protected readonly i18n = inject(I18nService);
  private readonly imageStore = inject(ImageStore);
  private readonly confirm = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly i = Icons;

  protected readonly dialogOpen = signal(false);
  protected readonly editing = signal<Perfume | null>(null);
  protected readonly images = signal<string[]>([]);
  /** Photos uploaded while the dialog is open; deleted again if not kept. */
  protected uploadedThisSession: string[] = [];
  private saved = false;

  protected readonly genderOptions = computed(() => GENDERS.map((v) => ({ value: v, label: this.i18n.tv('gender', v) })));
  protected readonly familyOptions = computed(() => FAMILIES.map((v) => ({ value: v, label: this.i18n.tv('family', v) })));
  protected readonly concentrationOptions = computed(() => CONCENTRATIONS.map((v) => ({ value: v, label: this.i18n.tv('conc', v) })));

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    brand: ['', Validators.required],
    description: ['', Validators.required],
    price: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    oldPrice: this.fb.control<number | null>(null),
    stock: [0, [Validators.required, Validators.min(0)]],
    volumeMl: [100, [Validators.required, Validators.min(1)]],
    gender: this.fb.control<Gender>('Unisex'),
    family: this.fb.control<Family>('Floral'),
    concentration: this.fb.control<Concentration>('EDP'),
    color: ['#d6b38a'],
    featured: [false],
    topNotes: [''],
    heartNotes: [''],
    baseNotes: [''],
  });

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
