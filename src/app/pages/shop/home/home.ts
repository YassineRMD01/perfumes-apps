import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { CartService } from '../../../core/cart.service';
import { CatalogService } from '../../../core/catalog.service';
import { TranslationKey } from '../../../core/i18n/en';
import { I18nService } from '../../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../../core/i18n/pipes';
import { ImageStore } from '../../../core/image-store.service';
import { ProductService } from '../../../core/product.service';
import { Bottle } from '../../../shared/bottle/bottle';
import { Icons } from '../../../shared/icons';
import { ProductCard } from '../../../shared/product-card/product-card';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FaIconComponent, ButtonModule, CarouselModule, ProductCard, Bottle, ...I18N_PIPES],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly products = inject(ProductService);
  protected readonly catalog = inject(CatalogService);
  protected readonly cart = inject(CartService);
  protected readonly images = inject(ImageStore);
  protected readonly i18n = inject(I18nService);
  protected readonly i = Icons;

  protected readonly hero = computed(() => this.products.featured().find((p) => p.kind === 'perfume') ?? this.products.products()[0]);
  /** Featured cosmetics first, then the newest */
  protected readonly beauty = computed(() =>
    [...this.products.cosmetics()]
      .sort((a, b) => Number(b.featured) - Number(a.featured) || b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4),
  );
  protected readonly brands = computed(() =>
    this.catalog.brands().map((b) => ({ ...b, count: this.products.countByBrand(b.id), logoSrc: this.images.resolve(b.logo) })),
  );

  protected readonly perks: { icon: typeof Icons.truck; title: TranslationKey; text: TranslationKey }[] = [
    { icon: Icons.truck, title: 'perk.delivery', text: 'perk.deliveryText' },
    { icon: Icons.shield, title: 'perk.authentic', text: 'perk.authenticText' },
    { icon: Icons.gem, title: 'perk.samples', text: 'perk.samplesText' },
    { icon: Icons.reset, title: 'perk.returns', text: 'perk.returnsText' },
  ];

  protected readonly responsive = [
    { breakpoint: '1280px', numVisible: 3, numScroll: 1 },
    { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
    { breakpoint: '640px', numVisible: 1, numScroll: 1 },
  ];
}
