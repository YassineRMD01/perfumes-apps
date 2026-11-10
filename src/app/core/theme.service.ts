import { computed, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import { load } from './storage';

export type ThemeMode = 'light' | 'dark';

/** Light / dark appearance, chosen by each visitor (light by default). */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly mode = signal<ThemeMode>(load<ThemeMode>('theme', 'light'));
  readonly isDark = computed(() => this.mode() === 'dark');

  constructor() {
    effect(() => {
      const dark = this.isDark();
      // ".app-dark" drives both PrimeNG (darkModeSelector) and our CSS tokens
      this.document.documentElement.classList.toggle('app-dark', dark);
      this.document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
      try {
        localStorage.setItem('lumora.theme', JSON.stringify(this.mode()));
      } catch {
        /* ignore */
      }
    });
  }

  toggle(): void {
    this.mode.update((m) => (m === 'dark' ? 'light' : 'dark'));
  }
}
