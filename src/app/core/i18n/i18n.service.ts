import { computed, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import { PrimeNG } from 'primeng/config';
import { load } from '../storage';
import { ar } from './ar';
import { en, TranslationKey } from './en';
import { es } from './es';
import { fr } from './fr';

export type Lang = 'en' | 'fr' | 'es' | 'ar';

export interface LanguageOption {
  code: Lang;
  label: string; // native name
  short: string;
  locale: string; // Intl locale
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', short: 'EN', locale: 'en-US', dir: 'ltr' },
  { code: 'fr', label: 'Français', short: 'FR', locale: 'fr-FR', dir: 'ltr' },
  { code: 'es', label: 'Español', short: 'ES', locale: 'es-ES', dir: 'ltr' },
  // Latin digits keep prices, quantities and order numbers consistent across languages
  { code: 'ar', label: 'العربية', short: 'ع', locale: 'ar-u-nu-latn', dir: 'rtl' },
];

const DICTIONARIES: Record<Lang, Record<TranslationKey, string>> = { en, fr, es, ar };

export type Params = Record<string, string | number>;

function detectLang(): Lang {
  const saved = load<Lang | null>('lang', null);
  if (saved && saved in DICTIONARIES) return saved;
  const browser = (navigator.language || 'en').slice(0, 2) as Lang;
  return browser in DICTIONARIES ? browser : 'en';
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly primeng = inject(PrimeNG);

  readonly lang = signal<Lang>(detectLang());
  readonly option = computed(() => LANGUAGES.find((l) => l.code === this.lang())!);
  readonly locale = computed(() => this.option().locale);
  readonly dir = computed(() => this.option().dir);
  readonly isRtl = computed(() => this.dir() === 'rtl');

  private readonly currencyFmt = computed(
    () => new Intl.NumberFormat(this.locale(), { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' }),
  );
  private readonly currencyFmtInt = computed(
    () => new Intl.NumberFormat(this.locale(), { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }),
  );

  constructor() {
    effect(() => {
      const opt = this.option();
      const html = this.document.documentElement;
      html.lang = opt.code;
      html.dir = opt.dir;
      try {
        localStorage.setItem('essence.lang', JSON.stringify(opt.code));
      } catch {
        /* ignore */
      }
      this.primeng.setTranslation({
        emptyMessage: this.t('prime.empty'),
        emptyFilterMessage: this.t('prime.empty'),
        emptySearchMessage: this.t('prime.empty'),
        selectionMessage: this.t('prime.selection'),
        passwordPrompt: this.t('prime.passwordPrompt'),
        weak: this.t('prime.weak'),
        medium: this.t('prime.medium'),
        strong: this.t('prime.strong'),
        accept: this.t('common.yes'),
        reject: this.t('common.no'),
      });
    });
  }

  use(lang: Lang): void {
    this.lang.set(lang);
  }

  /** Translate a key, replacing {placeholders} with params. Reactive when called inside templates/computeds. */
  t(key: TranslationKey, params?: Params): string {
    const text = DICTIONARIES[this.lang()][key] ?? en[key] ?? key;
    return params ? text.replace(/\{(\w+)\}/g, (_, p) => String(params[p] ?? `{${p}}`)) : text;
  }

  /** Translate an enum-like value, e.g. tv('status', 'Pending') → key "status.Pending". */
  tv(prefix: string, value: string): string {
    return this.t(`${prefix}.${value}` as TranslationKey);
  }

  money(value: number | null | undefined, wholeNumbers = false): string {
    // Some locales (e.g. Arabic) print "US$" even with narrowSymbol: normalise to "$"
    return (wholeNumbers ? this.currencyFmtInt() : this.currencyFmt()).format(value ?? 0)
      .replace(/US\$|\$US/, '$')
      .replace(/[\u200e\u200f\u061c]/g, ''); // drop bidi marks so amounts read correctly inside LTR spans
  }

  date(value: string | Date, style: 'short' | 'date' | 'datetime' = 'date'): string {
    const opts: Intl.DateTimeFormatOptions =
      style === 'short'
        ? { month: 'short', day: 'numeric' }
        : style === 'datetime'
          ? { dateStyle: 'medium', timeStyle: 'short' }
          : { dateStyle: 'medium' };
    return new Intl.DateTimeFormat(this.locale(), opts).format(new Date(value));
  }
}
