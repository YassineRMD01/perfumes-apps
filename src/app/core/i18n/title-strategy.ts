import { effect, inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslationKey } from './en';
import { SettingsService } from '../settings.service';
import { I18nService } from './i18n.service';

/** Route titles are translation keys; the document title follows the active language. */
@Injectable()
export class I18nTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly i18n = inject(I18nService);
  private readonly settings = inject(SettingsService);
  private key: string | undefined;

  constructor() {
    super();
    effect(() => {
      this.i18n.lang();
      this.settings.storeName();
      this.apply();
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.key = this.buildTitle(snapshot);
    this.apply();
  }

  private apply(): void {
    const page = this.key ? this.i18n.t(this.key as TranslationKey) : '';
    const store = this.settings.storeName();
    this.title.setTitle(page ? `${page} · ${store}` : store);
  }
}
