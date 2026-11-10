import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
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
import { CONCENTRATIONS, Concentration, FAMILIES, Family, GENDERS, Gender, Perfume, PerfumeInput } from '../../core/models';
import { ProductService } from '../../core/product.service';
import { Bottle } from '../../shared/bottle';
import { Icons } from '../../shared/icons';

const splitNotes = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

@Component({
  selector: 'app-admin-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, FormsModule, ReactiveFormsModule, FaIconComponent, ButtonModule, DialogModule, IconFieldModule, InputIconModule, InputNumberModule,
    InputTextModule, SelectModule, TableModule, TagModule, TextareaModule, ToggleSwitchModule, TooltipModule, Bottle,
  ],
  template: `
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-3xl font-bold">Products</h2>
        <p class="text-sm text-stone-500">{{ products.products().length }} fragrances in catalog</p>
      </div>
      <p-button (onClick)="openNew()"><fa-icon [icon]="i.plus" /> New perfume</p-button>
    </div>

    <div class="card overflow-hidden">
      <p-table #dt [value]="products.products()" dataKey="id" [paginator]="true" [rows]="8" [rowsPerPageOptions]="[8, 16, 32]"
               [globalFilterFields]="['name', 'brand', 'family', 'gender']" [tableStyle]="{ 'min-width': '60rem' }"
               sortField="createdAt" [sortOrder]="-1" [rowHover]="true">
        <ng-template #caption>
          <div class="flex flex-wrap items-center gap-3">
            <p-iconfield>
              <p-inputicon><fa-icon [icon]="i.search" class="text-stone-400" /></p-inputicon>
              <input pInputText placeholder="Search products…" (input)="filter(dt, $event)" />
            </p-iconfield>
          </div>
        </ng-template>
        <ng-template #header>
          <tr>
            <th class="w-16"></th>
            <th pSortableColumn="name">Perfume <p-sortIcon field="name" /></th>
            <th pSortableColumn="family">Family <p-sortIcon field="family" /></th>
            <th pSortableColumn="gender">For <p-sortIcon field="gender" /></th>
            <th pSortableColumn="price">Price <p-sortIcon field="price" /></th>
            <th pSortableColumn="stock">Stock <p-sortIcon field="stock" /></th>
            <th>Featured</th>
            <th class="w-28 text-right">Actions</th>
          </tr>
        </ng-template>
        <ng-template #body let-p>
          <tr>
            <td><div class="flex h-12 w-10 items-center justify-center rounded bg-stone-100 p-1"><app-bottle class="h-full" [color]="p.color" [name]="p.name" [imageUrl]="p.imageUrl" /></div></td>
            <td>
              <div class="font-medium">{{ p.name }}</div>
              <div class="text-xs text-stone-500">{{ p.brand }} · {{ p.concentration }} {{ p.volumeMl }}ml</div>
            </td>
            <td>{{ p.family }}</td>
            <td>{{ p.gender }}</td>
            <td>
              {{ p.price | currency }}
              @if (p.oldPrice) { <div class="text-xs text-stone-400 line-through">{{ p.oldPrice | currency }}</div> }
            </td>
            <td><p-tag [value]="p.stock === 0 ? 'Out of stock' : p.stock + ' units'" [severity]="p.stock === 0 ? 'danger' : p.stock <= 5 ? 'warn' : 'success'" /></td>
            <td>@if (p.featured) { <fa-icon [icon]="i.star" class="text-amber-500" /> } @else { <span class="text-stone-300">—</span> }</td>
            <td class="text-right">
              <p-button [text]="true" [rounded]="true" severity="secondary" pTooltip="Edit" (onClick)="openEdit(p)"><fa-icon [icon]="i.edit" /></p-button>
              <p-button [text]="true" [rounded]="true" severity="danger" pTooltip="Delete" (onClick)="remove(p)"><fa-icon [icon]="i.trash" /></p-button>
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr><td colspan="8" class="py-10 text-center text-stone-500">No products found.</td></tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [(visible)]="dialogOpen" [modal]="true" [header]="editing() ? 'Edit perfume' : 'New perfume'"
              [style]="{ width: '52rem' }" [breakpoints]="{ '960px': '95vw' }" [draggable]="false">
      <form [formGroup]="form" (ngSubmit)="save()" id="productForm" class="grid gap-4 md:grid-cols-[180px_1fr]">
        <div class="flex flex-col items-center gap-3">
          <div class="flex h-48 w-full items-center justify-center rounded-xl bg-stone-100 p-4">
            <app-bottle class="h-full" [color]="form.controls.color.value" [name]="form.controls.name.value || 'Perfume'"
                        [brand]="form.controls.brand.value" [imageUrl]="form.controls.imageUrl.value" />
          </div>
          <label class="flex w-full items-center justify-between text-sm">
            Bottle color <input type="color" formControlName="color" class="h-8 w-12 cursor-pointer rounded border border-stone-300" />
          </label>
          <label class="flex w-full items-center justify-between text-sm">Featured <p-toggleswitch formControlName="featured" /></label>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div><label class="field-label">Name *</label><input pInputText formControlName="name" class="w-full" [invalid]="bad('name')" /></div>
          <div><label class="field-label">Brand *</label><input pInputText formControlName="brand" class="w-full" [invalid]="bad('brand')" /></div>
          <div class="sm:col-span-2"><label class="field-label">Description *</label><textarea pTextarea formControlName="description" rows="3" class="w-full" [invalid]="bad('description')"></textarea></div>
          <div><label class="field-label">Price *</label><p-inputnumber formControlName="price" mode="currency" currency="USD" [fluid]="true" [invalid]="bad('price')" /></div>
          <div><label class="field-label">Compare-at price</label><p-inputnumber formControlName="oldPrice" mode="currency" currency="USD" [fluid]="true" /></div>
          <div><label class="field-label">Stock *</label><p-inputnumber formControlName="stock" [min]="0" [showButtons]="true" [fluid]="true" /></div>
          <div><label class="field-label">Volume (ml) *</label><p-inputnumber formControlName="volumeMl" [min]="1" suffix=" ml" [fluid]="true" /></div>
          <div><label class="field-label">For</label><p-select [options]="genders" formControlName="gender" class="w-full" appendTo="body" /></div>
          <div><label class="field-label">Family</label><p-select [options]="families" formControlName="family" class="w-full" appendTo="body" /></div>
          <div><label class="field-label">Concentration</label><p-select [options]="concentrations" formControlName="concentration" class="w-full" appendTo="body" /></div>
          <div><label class="field-label">Image URL (optional)</label><input pInputText formControlName="imageUrl" class="w-full" placeholder="https://…" /></div>
          <div class="sm:col-span-2 grid gap-4 sm:grid-cols-3">
            <div><label class="field-label">Top notes</label><input pInputText formControlName="topNotes" class="w-full" placeholder="Bergamot, Lemon" /></div>
            <div><label class="field-label">Heart notes</label><input pInputText formControlName="heartNotes" class="w-full" placeholder="Rose, Jasmine" /></div>
            <div><label class="field-label">Base notes</label><input pInputText formControlName="baseNotes" class="w-full" placeholder="Musk, Amber" /></div>
          </div>
        </div>
      </form>
      <ng-template #footer>
        <p-button severity="secondary" [text]="true" (onClick)="dialogOpen.set(false)">Cancel</p-button>
        <p-button type="submit" form="productForm"><fa-icon [icon]="i.check" /> {{ editing() ? 'Save changes' : 'Create' }}</p-button>
      </ng-template>
    </p-dialog>
  `,
})
export class AdminProducts {
  protected readonly products = inject(ProductService);
  private readonly confirm = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly i = Icons;
  protected readonly genders = GENDERS;
  protected readonly families = FAMILIES;
  protected readonly concentrations = CONCENTRATIONS;

  protected readonly dialogOpen = signal(false);
  protected readonly editing = signal<Perfume | null>(null);

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
    imageUrl: [''],
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

  openNew(): void {
    this.editing.set(null);
    this.form.reset();
    this.dialogOpen.set(true);
  }

  openEdit(p: Perfume): void {
    this.editing.set(p);
    this.form.reset({
      ...p,
      oldPrice: p.oldPrice ?? null,
      imageUrl: p.imageUrl ?? '',
      topNotes: p.topNotes.join(', '),
      heartNotes: p.heartNotes.join(', '),
      baseNotes: p.baseNotes.join(', '),
    });
    this.dialogOpen.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.add({ severity: 'warn', summary: 'Please fill in the required fields', life: 2500 });
      return;
    }
    const v = this.form.getRawValue();
    const input: PerfumeInput = {
      ...v,
      price: v.price ?? 0,
      oldPrice: v.oldPrice || null,
      imageUrl: v.imageUrl.trim() || null,
      topNotes: splitNotes(v.topNotes),
      heartNotes: splitNotes(v.heartNotes),
      baseNotes: splitNotes(v.baseNotes),
    };
    const current = this.editing();
    if (current) {
      this.products.update(current.id, input);
      this.toast.add({ severity: 'success', summary: 'Perfume updated', detail: input.name, life: 2500 });
    } else {
      this.products.create(input);
      this.toast.add({ severity: 'success', summary: 'Perfume created', detail: input.name, life: 2500 });
    }
    this.dialogOpen.set(false);
  }

  remove(p: Perfume): void {
    this.confirm.confirm({
      header: 'Delete perfume?',
      message: `“${p.name}” will be permanently removed from the catalog.`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.products.delete(p.id);
        this.toast.add({ severity: 'success', summary: 'Perfume deleted', detail: p.name, life: 2500 });
      },
    });
  }
}
