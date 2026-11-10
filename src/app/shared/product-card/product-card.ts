import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CartService } from '../../core/cart.service';
import { CatalogService } from '../../core/catalog.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../core/i18n/pipes';
import { ImageStore } from '../../core/image-store.service';
import { Perfume } from '../../core/models';
import { WishlistService } from '../../core/wishlist.service';
import { Bottle } from '../bottle/bottle';
import { Icons } from '../icons';

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FaIconComponent, ButtonModule, TagModule, Bottle, ...I18N_PIPES],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  readonly product = input.required<Perfume>();

  private readonly cart = inject(CartService);
  private readonly wishlist = inject(WishlistService);
  private readonly toast = inject(MessageService);
  private readonly images = inject(ImageStore);
  private readonly catalog = inject(CatalogService);
  private readonly i18n = inject(I18nService);
  protected readonly i = Icons;

  protected readonly cover = computed(() => this.images.resolve(this.product().images[0]));
  protected readonly hoverImage = computed(() => this.images.resolve(this.product().images[1]));
  protected readonly wished = computed(() => this.wishlist.ids().includes(this.product().id));
  protected readonly discount = computed(() => {
    const { price, oldPrice } = this.product();
    return oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;
  });

  addToCart(): void {
    const p = this.product();
    const added = this.cart.add(p.id);
    this.toast.add(
      added
        ? { severity: 'success', summary: this.i18n.t('toast.addedToCart'), detail: `${p.name} — ${this.catalog.brandName(p.brandId)}`, life: 2500 }
        : { severity: 'warn', summary: this.i18n.t('toast.stockLimit'), detail: this.i18n.t('toast.stockLimitDetail', { name: p.name }), life: 2500 },
    );
  }

  toggleWish(): void {
    const added = this.wishlist.toggle(this.product().id);
    this.toast.add({
      severity: 'info',
      summary: this.i18n.t(added ? 'toast.savedWish' : 'toast.removedWish'),
      detail: this.product().name,
      life: 2000,
    });
  }
}
