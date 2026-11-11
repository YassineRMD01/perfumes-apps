import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslationKey } from './en';
import { CatalogService } from '../catalog.service';
import { CurrencyService } from '../currency.service';
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
  transform(
    value: string,
    prefix: 'gender' | 'conc' | 'status' | 'payment' | 'seg' | 'cur' | 'accent' | 'sort' | 'longevity' | 'longevityShort' | 'season' | 'time' | 'kind' | 'skin' | 'pack',
  ): string {
    return this.i18n.tv(prefix, value);
  }
}

/** USD amount converted to the visitor's currency: {{ price | money }} · {{ total | money: true }} (no decimals) */
@Pipe({ name: 'money', pure: false })
export class MoneyPipe implements PipeTransform {
  private readonly currency = inject(CurrencyService);
  transform(value: number | null | undefined, wholeNumbers = false): string {
    return this.currency.format(value, wholeNumbers);
  }
}

/** Brand id → name: {{ p.brandId | brandName }} */
@Pipe({ name: 'brandName', pure: false })
export class BrandNamePipe implements PipeTransform {
  private readonly catalog = inject(CatalogService);
  transform(id: number): string {
    return this.catalog.brandName(id);
  }
}

/** Category id → name (or description) in the current language: {{ p.categoryId | categoryName }} */
@Pipe({ name: 'categoryName', pure: false })
export class CategoryNamePipe implements PipeTransform {
  private readonly catalog = inject(CatalogService);
  private readonly i18n = inject(I18nService);
  transform(id: string, field: 'name' | 'description' = 'name'): string {
    const c = this.catalog.category(id);
    if (!c) return '—';
    return c[field][this.i18n.lang()] || c[field].en;
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

export const I18N_PIPES = [TranslatePipe, TranslateValuePipe, MoneyPipe, LocalDatePipe, BrandNamePipe, CategoryNamePipe] as const;
