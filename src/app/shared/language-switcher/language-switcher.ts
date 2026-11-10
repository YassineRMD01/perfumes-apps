import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { I18nService, LANGUAGES } from '../../core/i18n/i18n.service';
import { Icons } from '../icons';

@Component({
  selector: 'app-language-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FaIconComponent, MenuModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcher {
  protected readonly i18n = inject(I18nService);
  protected readonly i = Icons;

  protected readonly items = computed<MenuItem[]>(() =>
    LANGUAGES.map((l) => ({
      label: l.label,
      state: { code: l.code, active: l.code === this.i18n.lang() },
      command: () => this.i18n.use(l.code),
    })),
  );
}
