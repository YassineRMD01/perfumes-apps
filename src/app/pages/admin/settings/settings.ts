import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { generatePalette, isHexColor } from '../../../core/color';
import { I18nService } from '../../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../../core/i18n/pipes';
import { ImageStore } from '../../../core/image-store.service';
import { ACCENT_PRESETS, CURRENCIES, CurrencyCode, DEFAULT_SETTINGS, StoreSettings } from '../../../core/models';
import { SettingsService } from '../../../core/settings.service';
import { Icons } from '../../../shared/icons';
import { PhotoManager } from '../../../shared/photo-manager/photo-manager';

@Component({
  selector: 'app-admin-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, FaIconComponent, ButtonModule, InputNumberModule, InputTextModule, SelectButtonModule, PhotoManager, ...I18N_PIPES],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class AdminSettings {
  private readonly settings = inject(SettingsService);
  protected readonly images = inject(ImageStore);
  private readonly confirm = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  protected readonly i18n = inject(I18nService);
  protected readonly i = Icons;
  protected readonly presets = ACCENT_PRESETS;
  protected readonly otherCurrencies = CURRENCIES.filter((c) => c !== 'USD');

  /** Working copy edited by the form; applied to the whole store on save. */
  protected readonly draft = signal<StoreSettings>(structuredClone(this.settings.settings()));
  protected readonly logo = signal<string[]>(this.draft().logo ? [this.draft().logo!] : []);
  private uploaded: string[] = [];

  protected readonly dirty = computed(
    () => JSON.stringify({ ...this.draft(), logo: this.logo()[0] ?? null }) !== JSON.stringify(this.settings.settings()),
  );
  protected readonly previewPalette = computed(() => generatePalette(isHexColor(this.draft().accent) ? this.draft().accent : DEFAULT_SETTINGS.accent));
  protected readonly isCustomAccent = computed(() => !this.presets.some((p) => p.color === this.draft().accent));
  protected readonly currencyOptions = computed(() => CURRENCIES.map((c) => ({ value: c, label: c })));

  patch(changes: Partial<StoreSettings>): void {
    this.draft.update((d) => ({ ...d, ...changes }));
  }

  setRate(code: CurrencyCode, value: number | null): void {
    this.draft.update((d) => ({ ...d, rates: { ...d.rates, [code]: value && value > 0 ? value : d.rates[code] } }));
  }

  onUploaded(ref: string): void {
    this.uploaded.push(ref);
  }

  save(): void {
    const d = this.draft();
    const next: StoreSettings = {
      ...d,
      storeName: d.storeName.trim() || DEFAULT_SETTINGS.storeName,
      accent: isHexColor(d.accent) ? d.accent : DEFAULT_SETTINGS.accent,
      logo: this.logo()[0] ?? null,
      rates: { ...d.rates, USD: 1 },
    };
    // Drop logos uploaded during this edit but not kept
    this.images.remove(this.uploaded.filter((r) => r !== next.logo));
    this.uploaded = [];
    this.settings.save(next);
    this.draft.set(structuredClone(next));
    this.toast.add({ severity: 'success', summary: this.i18n.t('toast.settingsSaved'), life: 2500 });
  }

  reset(): void {
    this.confirm.confirm({
      header: this.i18n.t('set.resetTitle'),
      message: this.i18n.t('set.resetMsg'),
      acceptLabel: this.i18n.t('set.reset'),
      rejectLabel: this.i18n.t('common.cancel'),
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.images.remove(this.uploaded);
        this.uploaded = [];
        this.settings.reset();
        this.draft.set(structuredClone(DEFAULT_SETTINGS));
        this.logo.set([]);
        this.toast.add({ severity: 'success', summary: this.i18n.t('toast.settingsSaved'), life: 2500 });
      },
    });
  }
}
