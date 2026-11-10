import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { AuthService } from '../../../core/auth.service';
import { CartService } from '../../../core/cart.service';
import { TranslationKey } from '../../../core/i18n/en';
import { I18nService } from '../../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../../core/i18n/pipes';
import { PaymentMethod } from '../../../core/models';
import { OrderService } from '../../../core/order.service';
import { Bottle } from '../../../shared/bottle/bottle';
import { Icons } from '../../../shared/icons';

@Component({
  selector: 'app-checkout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CheckboxModule, RouterLink, FaIconComponent, ButtonModule, InputMaskModule, InputTextModule, SelectButtonModule, Bottle, ...I18N_PIPES],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  protected readonly cart = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly orders = inject(OrderService);
  private readonly router = inject(Router);
  private readonly toast = inject(MessageService);
  private readonly i18n = inject(I18nService);
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly i = Icons;
  protected readonly submitted = signal(false);
  protected readonly saveAddress = new FormControl(true, { nonNullable: true });
  protected readonly placing = signal(false);

  protected readonly shippingFields = [
    { key: 'fullName', label: 'co.fullName', wide: false },
    { key: 'phone', label: 'co.phone', wide: false },
    { key: 'address', label: 'co.address', wide: true },
    { key: 'city', label: 'co.city', wide: false },
    { key: 'zip', label: 'co.zip', wide: false },
    { key: 'country', label: 'co.country', wide: true },
  ] as const satisfies readonly { key: string; label: TranslationKey; wide: boolean }[];

  protected readonly paymentOptions = computed(() =>
    (['Card', 'Cash on delivery'] as PaymentMethod[]).map((value) => ({ label: this.i18n.tv('payment', value), value })),
  );

  protected readonly form = this.fb.group({
    shipping: this.fb.group({
      fullName: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      zip: ['', Validators.required],
      country: ['France', Validators.required],
    }),
    payment: this.fb.control<PaymentMethod>('Card'),
    card: this.fb.group({
      number: ['', Validators.required],
      expiry: ['', Validators.required],
      cvc: ['', Validators.required],
    }),
  });

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.form.controls.shipping.patchValue(user.address ?? { fullName: user.name, phone: user.phone ?? '' });
      this.saveAddress.setValue(!user.address);
    }
    this.form.controls.payment.valueChanges.subscribe((p) =>
      p === 'Card' ? this.form.controls.card.enable() : this.form.controls.card.disable(),
    );
  }

  protected invalid(path: string): boolean {
    const c = this.form.get(path);
    return !!c && c.invalid && (c.touched || this.submitted());
  }

  placeOrder(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.add({ severity: 'warn', summary: this.i18n.t('toast.completeForm'), life: 2500 });
      return;
    }
    this.placing.set(true);
    // Simulate a payment round-trip
    setTimeout(() => {
      const v = this.form.getRawValue();
      if (this.saveAddress.value) this.auth.saveAddress(v.shipping);
      const order = this.orders.place(v.shipping, v.payment);
      this.placing.set(false);
      this.toast.add({
        severity: 'success',
        summary: this.i18n.t('toast.orderPlaced'),
        detail: this.i18n.t('toast.orderPlacedDetail', { id: order.id }),
        life: 4000,
      });
      this.router.navigate(['/orders'], { queryParams: { placed: order.id } });
    }, 700);
  }
}
