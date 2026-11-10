import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { CartService } from '../../../core/cart.service';
import { TranslationKey } from '../../../core/i18n/en';
import { I18nService } from '../../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../../core/i18n/pipes';
import { ImageStore } from '../../../core/image-store.service';
import { ProductService } from '../../../core/product.service';
import { WishlistService } from '../../../core/wishlist.service';
import { Bottle } from '../../../shared/bottle/bottle';
import { Icons } from '../../../shared/icons';
import { ProductCard } from '../../../shared/product-card/product-card';

@Component({
  selector: 'app-product-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, FaIconComponent, ButtonModule, DividerModule, InputNumberModule, RatingModule, TagModule, Bottle, ProductCard, ...I18N_PIPES],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail {
  readonly id = input.required<string>();

  private readonly products = inject(ProductService);
  protected readonly cart = inject(CartService);
  private readonly wishlist = inject(WishlistService);
  private readonly toast = inject(MessageService);
  private readonly images = inject(ImageStore);
  protected readonly i18n = inject(I18nService);
  protected readonly i = Icons;
  protected readonly Math = Math;

  protected readonly product = computed(() => this.products.getById(Number(this.id())));
  protected readonly photos = computed(() =>
    (this.product()?.images ?? []).map((ref) => this.images.resolve(ref)).filter((s): s is string => !!s),
  );
  protected readonly active = linkedSignal(() => (this.product(), 0));
  protected readonly qty = linkedSignal(() => (this.product(), 1));
  protected readonly pyramid = computed(() => {
    const p = this.product();
    return p
      ? ([
          { t: 'pd.top', n: p.topNotes },
          { t: 'pd.heart', n: p.heartNotes },
          { t: 'pd.base', n: p.baseNotes },
        ] satisfies { t: TranslationKey; n: string[] }[])
      : [];
  });
  protected readonly inCart = computed(() => {
    const p = this.product();
    return p ? this.cart.lines().find((l) => l.product.id === p.id)?.qty ?? 0 : 0;
  });
  protected readonly wished = computed(() => this.wishlist.ids().includes(Number(this.id())));
  protected readonly related = computed(() => {
    const p = this.product();
    if (!p) return [];
    return this.products
      .products()
      .filter((x) => x.id !== p.id && (x.categoryId === p.categoryId || x.brandId === p.brandId))
      .slice(0, 4);
  });

  step(delta: number): void {
    const n = this.photos().length;
    if (n > 1) this.active.update((i) => (i + delta + n) % n);
  }

  addToCart(): void {
    const p = this.product()!;
    const added = this.cart.add(p.id, this.qty());
    this.toast.add({ severity: 'success', summary: this.i18n.t('toast.addedToCart'), detail: `${added} × ${p.name}`, life: 2500 });
    this.qty.set(1);
  }

  toggleWish(): void {
    const added = this.wishlist.toggle(this.product()!.id);
    this.toast.add({ severity: 'info', summary: this.i18n.t(added ? 'toast.savedWish' : 'toast.removedWish'), life: 2000 });
  }
}
