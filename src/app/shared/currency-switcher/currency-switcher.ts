import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { CurrencyService } from '../../core/currency.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { CURRENCIES } from '../../core/models';
import { Icons } from '../icons';

/** Lets any visitor (admin, client or guest) pick the display currency. */
@Component({
  selector: 'app-currency-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FaIconComponent, MenuModule],
  templateUrl: './currency-switcher.html',
  styleUrl: './currency-switcher.css',
})
export class CurrencySwitcher {
  protected readonly currency = inject(CurrencyService);
  protected readonly i18n = inject(I18nService);
  protected readonly i = Icons;

  protected readonly items = computed<MenuItem[]>(() =>
    CURRENCIES.map((code) => ({
      label: this.i18n.tv('cur', code),
      state: { code, symbol: this.currency.symbol(code), active: code === this.currency.code() },
      command: () => this.currency.use(code),
    })),
  );
}
