import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { I18nService } from '../../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../../core/i18n/pipes';
import { Review } from '../../../core/models';
import { ProductService } from '../../../core/product.service';
import { ReviewService } from '../../../core/review.service';
import { Icons } from '../../../shared/icons';
import { StarRating } from '../../../shared/star-rating/star-rating';

@Component({
  selector: 'app-admin-reviews',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, FaIconComponent, ButtonModule, IconFieldModule, InputIconModule, InputTextModule, TableModule, TooltipModule, StarRating, ...I18N_PIPES],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css',
})
export class AdminReviews {
  private readonly reviews = inject(ReviewService);
  private readonly products = inject(ProductService);
  private readonly confirm = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  private readonly i18n = inject(I18nService);
  protected readonly i = Icons;

  protected readonly search = signal('');
  /** 0 = all ratings */
  protected readonly rating = signal(0);
  protected readonly ratingFilters = [0, 5, 4, 3, 2, 1];

  private readonly all = computed(() =>
    this.reviews.reviews().map((r) => ({ ...r, productName: this.products.getById(r.productId)?.name ?? '—' })),
  );
  protected readonly rows = computed(() => {
    const term = this.search().trim().toLowerCase();
    const rating = this.rating();
    return this.all().filter(
      (r) =>
        (!rating || r.rating === rating) &&
        (!term || [r.productName, r.userName, r.comment].some((s) => s.toLowerCase().includes(term))),
    );
  });
  protected readonly summary = computed(() => {
    const list = this.all();
    const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;
    return { total: list.length, average: Math.round(avg * 10) / 10, low: list.filter((r) => r.rating <= 3).length };
  });

  remove(r: Review): void {
    this.confirm.confirm({
      header: this.i18n.t('arv.deleteTitle'),
      message: this.i18n.t('arv.deleteMsg', { name: r.userName }),
      acceptLabel: this.i18n.t('common.delete'),
      rejectLabel: this.i18n.t('common.cancel'),
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.reviews.delete(r.id);
        this.toast.add({ severity: 'success', summary: this.i18n.t('toast.reviewDeleted'), life: 2500 });
      },
    });
  }
}
