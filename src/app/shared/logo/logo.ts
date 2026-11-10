import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { I18N_PIPES } from '../../core/i18n/pipes';
import { SettingsService } from '../../core/settings.service';

let uid = 0;

/** Store logo: the admin's uploaded logo, or the built-in Lumora mark (tinted with the accent color). */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...I18N_PIPES],
  templateUrl: './logo.html',
  styleUrl: './logo.css',
})
export class Logo {
  protected readonly settings = inject(SettingsService);
  /** Show the store name next to the mark */
  readonly withText = input(true);
  /** Show the tagline under the name */
  readonly withTagline = input(false);
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  protected readonly gid = `logo-${++uid}`;
}
