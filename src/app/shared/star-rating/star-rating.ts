import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Icons } from '../icons';

/** Read-only star display supporting half stars. */
@Component({
  selector: 'app-star-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FaIconComponent],
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.css',
})
export class StarRating {
  readonly value = input(0);
  protected readonly stars = computed(() =>
    [1, 2, 3, 4, 5].map((n) => {
      const v = this.value();
      return v >= n - 0.25 ? Icons.star : v >= n - 0.75 ? Icons.starHalf : Icons.starOutline;
    }),
  );
}
