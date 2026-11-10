import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressBarModule } from 'primeng/progressbar';
import { CartService } from '../../../core/cart.service';
import { I18N_PIPES } from '../../../core/i18n/pipes';
import { Bottle } from '../../../shared/bottle/bottle';
import { Icons } from '../../../shared/icons';

@Component({
  selector: 'app-cart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, FaIconComponent, ButtonModule, InputNumberModule, ProgressBarModule, Bottle, ...I18N_PIPES],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  protected readonly cart = inject(CartService);
  protected readonly i = Icons;
  protected readonly remaining = computed(() => Math.max(0, this.cart.freeShippingThreshold() - this.cart.subtotal()));
  protected readonly progress = computed(() => Math.min(100, (this.cart.subtotal() / (this.cart.freeShippingThreshold() || 1)) * 100));
}
