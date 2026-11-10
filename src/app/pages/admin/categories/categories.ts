import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { CatalogService } from '../../../core/catalog.service';
import { I18nService, LANGUAGES } from '../../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../../core/i18n/pipes';
import { Category, Lang, Translated } from '../../../core/models';
import { ProductService } from '../../../core/product.service';
import { Icons } from '../../../shared/icons';

const empty = (): Translated => ({ en: '', fr: '', es: '', ar: '' });

@Component({
  selector: 'app-admin-categories',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, FaIconComponent, ButtonModule, DialogModule, InputTextModule, TooltipModule, ...I18N_PIPES],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class AdminCategories {
  private readonly catalog = inject(CatalogService);
  private readonly products = inject(ProductService);
  private readonly confirm = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  protected readonly i18n = inject(I18nService);
  protected readonly i = Icons;
  protected readonly languages = LANGUAGES;

  protected readonly cards = computed(() =>
    this.catalog.categories().map((c) => ({ ...c, count: this.products.countByCategory(c.id) })),
  );

  protected readonly dialogOpen = signal(false);
  protected readonly editing = signal<Category | null>(null);
  protected readonly submitted = signal(false);
  protected name: Translated = empty();
  protected description: Translated = empty();
  protected color = '#e9a0b4';

  protected label(c: Category): string {
    return c.name[this.i18n.lang()] || c.name.en;
  }

  open(category: Category | null): void {
    this.editing.set(category);
    this.name = category ? { ...category.name } : empty();
    this.description = category ? { ...category.description } : empty();
    this.color = category?.color ?? '#e9a0b4';
    this.submitted.set(false);
    this.dialogOpen.set(true);
  }

  save(): void {
    this.submitted.set(true);
    const en = this.name.en.trim();
    if (!en) return;
    // Missing translations fall back to English
    const fill = (t: Translated, fallback: string): Translated =>
      Object.fromEntries((Object.keys(t) as Lang[]).map((l) => [l, t[l].trim() || fallback])) as Translated;
    const input = { name: fill(this.name, en), description: fill(this.description, this.description.en.trim()), color: this.color };
    const current = this.editing();
    if (current) this.catalog.updateCategory(current.id, input);
    else this.catalog.createCategory(input);
    this.toast.add({ severity: 'success', summary: this.i18n.t('toast.categorySaved'), detail: input.name[this.i18n.lang()], life: 2500 });
    this.dialogOpen.set(false);
  }

  remove(c: Category): void {
    const n = this.products.countByCategory(c.id);
    const name = this.label(c);
    if (n) {
      this.toast.add({ severity: 'warn', summary: this.i18n.t('toast.cannotDelete'), detail: this.i18n.t('acat.inUse', { name, n }), life: 4500 });
      return;
    }
    this.confirm.confirm({
      header: this.i18n.t('acat.deleteTitle'),
      message: this.i18n.t('common.deleteMsg', { name }),
      acceptLabel: this.i18n.t('common.delete'),
      rejectLabel: this.i18n.t('common.cancel'),
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.catalog.deleteCategory(c.id);
        this.toast.add({ severity: 'success', summary: this.i18n.t('toast.categoryDeleted'), detail: name, life: 2500 });
      },
    });
  }
}
