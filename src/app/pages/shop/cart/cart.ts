import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { CartService } from '../../../core/cart.service';
import { CouponService } from '../../../core/coupon.service';
import { CurrencyService } from '../../../core/currency.service';
import { TranslationKey } from '../../../core/i18n/en';
import { I18nService } from '../../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../../core/i18n/pipes';
import { Bottle } from '../../../shared/bottle/bottle';
import { Icons } from '../../../shared/icons';

@Component({
  selector: 'app-cart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, FaIconComponent, ButtonModule, InputNumberModule, ProgressBarModule, InputTextModule, Bottle, ...I18N_PIPES],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  protected readonly cart = inject(CartService);
  protected readonly i = Icons;
  protected readonly remaining = computed(() => Math.max(0, this.cart.freeShippingThreshold() - this.cart.subtotal()));
  protected readonly progress = computed(() => Math.min(100, (this.cart.subtotal() / (this.cart.freeShippingThreshold() || 1)) * 100));

  private readonly coupons = inject(CouponService);
  private readonly currency = inject(CurrencyService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(MessageService);
  protected code = '';
  protected readonly couponError = signal('');

  constructor() {
    // A saved code that stops applying (cart under the minimum, code disabled…) is explained to the customer
    effect(() => {
      const code = this.cart.couponCode();
      const applied = this.cart.coupon();
      untracked(() => {
        if (code && !applied && !this.cart.isEmpty()) this.couponError.set(this.reason(code));
      });
    });
  }

  private reason(code: string): string {
    const check = this.coupons.check(code, this.cart.subtotal());
    if (check.ok) return '';
    return check.reason === 'minimum'
      ? this.i18n.t('coupon.minimum', { amount: this.currency.format(check.minSubtotal) })
      : this.i18n.t(`coupon.${check.reason}` as TranslationKey);
  }

  applyCoupon(): void {
    const code = this.code.trim();
    if (!code) return;
    const check = this.coupons.check(code, this.cart.subtotal());
    if (!check.ok) {
      this.couponError.set(this.reason(code));
      return;
    }
    this.couponError.set('');
    this.cart.applyCoupon(check.coupon.code);
    this.code = '';
    this.toast.add({ severity: 'success', summary: this.i18n.t('cart.couponApplied', { code: check.coupon.code }), life: 2500 });
  }

  removeCoupon(): void {
    this.cart.removeCoupon();
    this.couponError.set('');
  }
}
