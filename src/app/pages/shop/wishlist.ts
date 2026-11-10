import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { WishlistService } from '../../core/wishlist.service';
import { Icons } from '../../shared/icons';
import { ProductCard } from '../../shared/product-card';

@Component({
  selector: 'app-wishlist',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FaIconComponent, ButtonModule, ProductCard],
  template: `
    <div class="container-x py-10">
      <h1 class="mb-8 text-4xl font-bold">Wishlist</h1>
      @if (wishlist.products().length) {
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          @for (p of wishlist.products(); track p.id) { <app-product-card [product]="p" /> }
        </div>
      } @else {
        <div class="card flex flex-col items-center py-20 text-center">
          <fa-icon [icon]="i.heartOutline" class="text-5xl text-stone-300" />
          <h2 class="mt-4 text-2xl font-semibold">No favourites yet</h2>
          <p class="mt-1 text-stone-500">Tap the heart on any fragrance to save it here.</p>
          <p-button class="mt-6" routerLink="/shop">Explore fragrances</p-button>
        </div>
      }
    </div>
  `,
})
export class Wishlist {
  protected readonly wishlist = inject(WishlistService);
  protected readonly i = Icons;
}
