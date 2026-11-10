import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslationKey } from './en';
import { I18nService, Params } from './i18n.service';

// These pipes are impure on purpose: they read the language signal, so the view re-renders on language change.

/** {{ 'nav.home' | t }} · {{ 'shop.count' | t: { n: 3 } }} */
@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);
  transform(key: TranslationKey, params?: Params): string {
    return this.i18n.t(key, params);
  }
}

/** Translate enum values: {{ p.gender | tv: 'gender' }} */
@Pipe({ name: 'tv', pure: false })
export class TranslateValuePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);
  transform(value: string, prefix: 'gender' | 'family' | 'familyBlurb' | 'conc' | 'status' | 'payment' | 'seg'): string {
    return this.i18n.tv(prefix, value);
  }
}

/** Locale-aware USD amount: {{ price | money }} · {{ total | money: true }} (no decimals) */
@Pipe({ name: 'money', pure: false })
export class MoneyPipe implements PipeTransform {
  private readonly i18n = inject(I18nService);
  transform(value: number | null | undefined, wholeNumbers = false): string {
    return this.i18n.money(value, wholeNumbers);
  }
}

/** Locale-aware date: {{ d | ldate }} · {{ d | ldate: 'short' }} · {{ d | ldate: 'datetime' }} */
@Pipe({ name: 'ldate', pure: false })
export class LocalDatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);
  transform(value: string | Date, style: 'short' | 'date' | 'datetime' = 'date'): string {
    return this.i18n.date(value, style);
  }
}

export const I18N_PIPES = [TranslatePipe, TranslateValuePipe, MoneyPipe, LocalDatePipe] as const;
