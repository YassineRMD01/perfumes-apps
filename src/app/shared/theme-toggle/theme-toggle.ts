import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { I18N_PIPES } from '../../core/i18n/pipes';
import { ThemeService } from '../../core/theme.service';
import { Icons } from '../icons';

/** Light / dark switch available to every visitor. */
@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FaIconComponent, ...I18N_PIPES],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.css',
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);
  protected readonly i = Icons;
}
