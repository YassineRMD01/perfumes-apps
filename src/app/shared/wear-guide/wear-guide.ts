import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { I18N_PIPES } from '../../core/i18n/pipes';
import { LONGEVITIES, Perfume, SEASONS } from '../../core/models';
import { Icons } from '../icons';
import { SEASON_ICONS, TIME_ICONS } from '../wear-icons';

/** Longevity, seasons and day/night — compact chips for cards, or a full panel for the product page. */
@Component({
  selector: 'app-wear-guide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FaIconComponent, ...I18N_PIPES],
  templateUrl: './wear-guide.html',
  styleUrl: './wear-guide.css',
})
export class WearGuide {
  readonly perfume = input.required<Pick<Perfume, 'longevity' | 'seasons' | 'timeOfDay'>>();
  readonly compact = input(false);

  protected readonly i = Icons;
  protected readonly seasons = SEASONS;
  protected readonly seasonIcons = SEASON_ICONS;
  protected readonly timeIcons = TIME_ICONS;
  protected readonly levels = LONGEVITIES;
  /** 1–4 filled segments */
  protected readonly level = computed(() => LONGEVITIES.indexOf(this.perfume().longevity) + 1);
}
