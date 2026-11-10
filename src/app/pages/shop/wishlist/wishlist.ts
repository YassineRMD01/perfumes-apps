import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { I18N_PIPES } from '../../../core/i18n/pipes';
import { WishlistService } from '../../../core/wishlist.service';
import { Icons } from '../../../shared/icons';
import { ProductCard } from '../../../shared/product-card/product-card';

@Component({
  selector: 'app-wishlist',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FaIconComponent, ButtonModule, ProductCard, ...I18N_PIPES],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist {
  protected readonly wishlist = inject(WishlistService);
  protected readonly i = Icons;
}
