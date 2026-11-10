import { computed, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import { updatePrimaryPalette } from '@primeuix/themes';
import { generatePalette, SHADES } from './color';
import { ImageStore } from './image-store.service';
import { DEFAULT_SETTINGS, StoreSettings } from './models';
import { load, persist } from './storage';

/**
 * Store-wide settings edited by the admin (name, logo, accent color, currencies, free shipping).
 * They apply to everyone: admin, signed-in clients and anonymous visitors.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly document = inject(DOCUMENT);
  private readonly images = inject(ImageStore);
  private readonly _settings = signal<StoreSettings>({ ...DEFAULT_SETTINGS, ...load<Partial<StoreSettings>>('settings', {}) });

  readonly settings = this._settings.asReadonly();
  readonly storeName = computed(() => this._settings().storeName || DEFAULT_SETTINGS.storeName);
  readonly logo = computed(() => this.images.resolve(this._settings().logo));
  readonly palette = computed(() => generatePalette(this._settings().accent));

  constructor() {
    persist('settings', this._settings);

    // Apply the accent palette to PrimeNG and to the Tailwind "brand" color tokens
    effect(() => {
      const palette = this.palette();
      updatePrimaryPalette(palette);
      const root = this.document.documentElement.style;
      SHADES.forEach((shade) => root.setProperty(`--color-brand-${shade}`, palette[shade]));
    });
  }

  save(next: StoreSettings): void {
    const previous = this._settings();
    this._settings.set(next);
    if (previous.logo && previous.logo !== next.logo) this.images.remove([previous.logo]);
  }

  reset(): void {
    this.save({ ...DEFAULT_SETTINGS });
  }
}
