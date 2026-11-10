import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { CatalogService } from '../../../core/catalog.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../../core/i18n/pipes';
import { ImageStore } from '../../../core/image-store.service';
import { Brand } from '../../../core/models';
import { ProductService } from '../../../core/product.service';
import { Icons } from '../../../shared/icons';
import { PhotoManager } from '../../../shared/photo-manager/photo-manager';

@Component({
  selector: 'app-admin-brands',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, FaIconComponent, ButtonModule, DialogModule, IconFieldModule, InputIconModule, InputTextModule,
    TableModule, TagModule, TextareaModule, TooltipModule, PhotoManager, ...I18N_PIPES,
  ],
  templateUrl: './brands.html',
  styleUrl: './brands.css',
})
export class AdminBrands {
  private readonly catalog = inject(CatalogService);
  private readonly products = inject(ProductService);
  private readonly images = inject(ImageStore);
  private readonly confirm = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  protected readonly i18n = inject(I18nService);
  protected readonly i = Icons;

  protected readonly rows = computed(() =>
    this.catalog.brands().map((b) => ({ ...b, count: this.products.countByBrand(b.id), logoSrc: this.images.resolve(b.logo) })),
  );

  protected readonly dialogOpen = signal(false);
  protected readonly editing = signal<Brand | null>(null);
  /** Logo as a 0–1 item list so the shared photo manager can be reused. */
  protected readonly logo = signal<string[]>([]);
  private uploaded: string[] = [];
  private saved = false;

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', Validators.required],
    country: [''],
    description: [''],
  });

  filter(dt: Table, e: Event): void {
    dt.filterGlobal((e.target as HTMLInputElement).value, 'contains');
  }

  open(brand: Brand | null): void {
    this.editing.set(brand);
    this.form.reset(brand ? { name: brand.name, country: brand.country, description: brand.description } : {});
    this.logo.set(brand?.logo ? [brand.logo] : []);
    this.uploaded = [];
    this.saved = false;
    this.dialogOpen.set(true);
  }

  onUploaded(ref: string): void {
    this.uploaded.push(ref);
  }

  onHide(): void {
    const kept = this.saved ? this.logo() : [];
    this.images.remove(this.uploaded.filter((r) => !kept.includes(r)));
    this.uploaded = [];
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const name = v.name.trim();
    const current = this.editing();
    if (this.catalog.brands().some((b) => b.name.toLowerCase() === name.toLowerCase() && b.id !== current?.id)) {
      this.toast.add({ severity: 'warn', summary: this.i18n.t('ab.nameTaken'), life: 3000 });
      return;
    }
    const input = { name, country: v.country.trim(), description: v.description.trim(), logo: this.logo()[0] ?? null };
    if (current) this.catalog.updateBrand(current.id, input);
    else this.catalog.createBrand(input);
    this.saved = true;
    this.toast.add({ severity: 'success', summary: this.i18n.t('toast.brandSaved'), detail: name, life: 2500 });
    this.dialogOpen.set(false);
  }

  remove(brand: Brand): void {
    const n = this.products.countByBrand(brand.id);
    if (n) {
      this.toast.add({ severity: 'warn', summary: this.i18n.t('toast.cannotDelete'), detail: this.i18n.t('ab.inUse', { name: brand.name, n }), life: 4500 });
      return;
    }
    this.confirm.confirm({
      header: this.i18n.t('ab.deleteTitle'),
      message: this.i18n.t('common.deleteMsg', { name: brand.name }),
      acceptLabel: this.i18n.t('common.delete'),
      rejectLabel: this.i18n.t('common.cancel'),
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.catalog.deleteBrand(brand.id);
        this.toast.add({ severity: 'success', summary: this.i18n.t('toast.brandDeleted'), detail: brand.name, life: 2500 });
      },
    });
  }
}
