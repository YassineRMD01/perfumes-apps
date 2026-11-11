import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { TranslationKey } from '../../core/i18n/en';
import { I18nService } from '../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../core/i18n/pipes';
import { THEME_PREFERENCES, ThemePreference, ThemeService } from '../../core/theme.service';
import { Icons } from '../icons';

export const THEME_ICONS: Record<ThemePreference, typeof Icons.sun> = { system: Icons.desktop, light: Icons.sun, dark: Icons.moon };
export const THEME_LABELS: Record<ThemePreference, TranslationKey> = { system: 'pref.system', light: 'pref.light', dark: 'pref.dark' };

/** Appearance menu for every visitor: follow the device (System), Light or Dark. */
@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FaIconComponent, MenuModule, ...I18N_PIPES],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.css',
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);
  private readonly i18n = inject(I18nService);
  protected readonly i = Icons;
  protected iconFor(pref: ThemePreference) {
    return THEME_ICONS[pref];
  }

  protected readonly items = computed<MenuItem[]>(() =>
    THEME_PREFERENCES.map((pref) => ({
      label: this.i18n.t(THEME_LABELS[pref]),
      state: { pref, active: pref === this.theme.preference() },
      command: () => this.theme.set(pref),
    })),
  );
}
