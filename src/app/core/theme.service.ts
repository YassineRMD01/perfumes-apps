import { computed, DestroyRef, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import { load } from './storage';

export type ThemePreference = 'system' | 'light' | 'dark';
export const THEME_PREFERENCES: ThemePreference[] = ['system', 'light', 'dark'];

/**
 * Appearance chosen by each visitor. "system" (the default) follows the device setting and updates
 * live when it changes; "light" / "dark" force a mode.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');

  readonly preference = signal<ThemePreference>(load<ThemePreference>('theme', 'system'));
  /** Current device setting */
  readonly systemDark = signal(this.media?.matches ?? false);
  readonly isDark = computed(() => (this.preference() === 'system' ? this.systemDark() : this.preference() === 'dark'));

  constructor() {
    const onChange = (e: MediaQueryListEvent) => this.systemDark.set(e.matches);
    this.media?.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() => this.media?.removeEventListener('change', onChange));

    effect(() => {
      const dark = this.isDark();
      const html = this.document.documentElement;
      // ".app-dark" drives both PrimeNG (darkModeSelector) and our CSS tokens
      html.classList.toggle('app-dark', dark);
      html.style.colorScheme = dark ? 'dark' : 'light';
      this.document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0a0a0a' : '#ffffff');
    });
    effect(() => {
      try {
        localStorage.setItem('lumora.theme', JSON.stringify(this.preference()));
      } catch {
        /* ignore */
      }
    });
  }

  set(preference: ThemePreference): void {
    this.preference.set(preference);
  }

  /** Quick switch to the opposite of what is currently shown. */
  toggle(): void {
    this.preference.set(this.isDark() ? 'light' : 'dark');
  }
}
