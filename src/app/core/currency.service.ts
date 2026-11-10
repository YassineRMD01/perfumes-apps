import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { I18nService } from './i18n/i18n.service';
import { CURRENCIES, CurrencyCode } from './models';
import { SettingsService } from './settings.service';
import { load } from './storage';

/**
 * Display currency chosen by each visitor. Prices are stored in USD and converted
 * with the exchange rates the admin sets in the store settings.
 */
@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly i18n = inject(I18nService);
  private readonly settings = inject(SettingsService);

  private readonly chosen = signal<CurrencyCode | null>(load<CurrencyCode | null>('currency', null));
  /** Visitor choice, falling back to the store default currency. */
  readonly code = computed<CurrencyCode>(() => {
    const c = this.chosen();
    return c && CURRENCIES.includes(c) ? c : this.settings.settings().defaultCurrency;
  });
  readonly rate = computed(() => this.settings.settings().rates[this.code()] || 1);

  private readonly fmt = computed(() => this.formatter(2));
  private readonly fmtWhole = computed(() => this.formatter(0));

  constructor() {
    effect(() => {
      const c = this.chosen();
      try {
        if (c) localStorage.setItem('lumora.currency', JSON.stringify(c));
      } catch {
        /* ignore */
      }
    });
  }

  use(code: CurrencyCode): void {
    this.chosen.set(code);
  }

  /** Format an amount given in USD in the visitor's currency and language. */
  format(usd: number | null | undefined, wholeNumbers = false): string {
    const value = (usd ?? 0) * this.rate();
    return (wholeNumbers ? this.fmtWhole() : this.fmt())
      .format(value)
      .replace(/US\$|\$US/, '$')
      .replace(/[‎‏؜]/g, ''); // bidi marks would reorder amounts inside LTR spans
  }

  /** Short symbol for a currency in the current language (e.g. "$", "€", "MAD"). */
  symbol(code: CurrencyCode): string {
    const part = new Intl.NumberFormat(this.i18n.locale(), { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' })
      .formatToParts(0)
      .find((p) => p.type === 'currency');
    return (part?.value ?? code).replace(/US\$|\$US/, '$').replace(/[‎‏؜]/g, '');
  }

  private formatter(digits: number): Intl.NumberFormat {
    return new Intl.NumberFormat(this.i18n.locale(), {
      style: 'currency',
      currency: this.code(),
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }
}
