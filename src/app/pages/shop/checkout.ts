import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { AuthService } from '../../core/auth.service';
import { CartService } from '../../core/cart.service';
import { TranslationKey } from '../../core/i18n/en';
import { I18nService } from '../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../core/i18n/pipes';
import { PaymentMethod } from '../../core/models';
import { OrderService } from '../../core/order.service';
import { Bottle } from '../../shared/bottle';
import { Icons } from '../../shared/icons';

@Component({
  selector: 'app-checkout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, FaIconComponent, ButtonModule, InputMaskModule, InputTextModule, SelectButtonModule, Bottle, ...I18N_PIPES],
  template: `
    <div class="container-x py-10">
      <h1 class="mb-8 text-4xl font-bold">{{ 'co.title' | t }}</h1>

      @if (cart.isEmpty()) {
        <div class="card py-16 text-center">
          <p class="text-stone-500">{{ 'co.empty' | t }}</p>
          <p-button class="mt-4 inline-block" routerLink="/shop">{{ 'co.goShopping' | t }}</p-button>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="placeOrder()" class="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div class="flex flex-col gap-6">
            <section class="card p-6" formGroupName="shipping">
              <h2 class="mb-5 flex items-center gap-2 text-xl font-semibold"><fa-icon [icon]="i.truck" class="text-amber-700" /> {{ 'co.shipping' | t }}</h2>
              <div class="grid gap-4 sm:grid-cols-2">
                @for (f of shippingFields; track f.key) {
                  <div [class.sm:col-span-2]="f.wide">
                    <label class="field-label" [for]="f.key">{{ f.label | t }}</label>
                    <input pInputText [id]="f.key" [formControlName]="f.key" class="w-full" [invalid]="invalid('shipping.' + f.key)"
                           [attr.dir]="f.key === 'phone' || f.key === 'zip' ? 'ltr' : null" />
                    @if (invalid('shipping.' + f.key)) { <p class="field-error">{{ 'co.required' | t: { field: (f.label | t) } }}</p> }
                  </div>
                }
              </div>
            </section>

            <section class="card p-6">
              <h2 class="mb-5 flex items-center gap-2 text-xl font-semibold"><fa-icon [icon]="i.card" class="text-amber-700" /> {{ 'co.payment' | t }}</h2>
              <p-selectbutton [options]="paymentOptions()" formControlName="payment" optionLabel="label" optionValue="value" [allowEmpty]="false" />
              @if (form.controls.payment.value === 'Card') {
                <div class="mt-5 grid gap-4 sm:grid-cols-2" formGroupName="card">
                  <div class="sm:col-span-2">
                    <label class="field-label">{{ 'co.cardNumber' | t }}</label>
                    <p-inputmask mask="9999 9999 9999 9999" formControlName="number" dir="ltr" placeholder="4242 4242 4242 4242" styleClass="w-full" />
                  </div>
                  <div>
                    <label class="field-label">{{ 'co.expiry' | t }}</label>
                    <p-inputmask mask="99/99" formControlName="expiry" dir="ltr" placeholder="MM/YY" styleClass="w-full" />
                  </div>
                  <div>
                    <label class="field-label">{{ 'co.cvc' | t }}</label>
                    <p-inputmask mask="999" formControlName="cvc" dir="ltr" placeholder="123" styleClass="w-full" />
                  </div>
                  @if (submitted() && form.controls.card.invalid) {
                    <p class="field-error sm:col-span-2">{{ 'co.cardIncomplete' | t }}</p>
                  }
                  <p class="text-xs text-stone-500 sm:col-span-2"><fa-icon [icon]="i.lock" /> {{ 'co.demoNote' | t }}</p>
                </div>
              } @else {
                <p class="mt-4 text-sm text-stone-600"><fa-icon [icon]="i.cash" class="text-emerald-600" /> {{ 'co.codNote' | t }}</p>
              }
            </section>
          </div>

          <aside class="card h-fit p-6 lg:sticky lg:top-24">
            <h2 class="mb-4 text-xl font-semibold">{{ 'co.yourOrder' | t }}</h2>
            <ul class="mb-4 space-y-3">
              @for (l of cart.lines(); track l.product.id) {
                <li class="flex items-center gap-3">
                  <div class="flex h-14 w-12 items-center justify-center overflow-hidden rounded-lg bg-stone-100" [class.p-1]="!l.product.images.length">
                    <app-bottle class="h-full w-full" [color]="l.product.color" [name]="l.product.name" [brand]="l.product.brand" [image]="l.product.images[0]" fit="cover" />
                  </div>
                  <div class="flex-1 text-sm">
                    <div class="font-medium">{{ l.product.name }}</div>
                    <div class="text-xs text-stone-500">{{ 'co.qty' | t: { n: l.qty } }}</div>
                  </div>
                  <div class="text-sm font-semibold">{{ l.lineTotal | money }}</div>
                </li>
              }
            </ul>
            <dl class="space-y-2 border-t border-stone-200 pt-4 text-sm">
              <div class="flex justify-between"><dt class="text-stone-500">{{ 'common.subtotal' | t }}</dt><dd>{{ cart.subtotal() | money }}</dd></div>
              <div class="flex justify-between"><dt class="text-stone-500">{{ 'common.shipping' | t }}</dt><dd>{{ cart.shipping() ? (cart.shipping() | money) : ('common.free' | t) }}</dd></div>
              <div class="flex justify-between pt-2 text-lg font-bold"><dt>{{ 'common.total' | t }}</dt><dd>{{ cart.total() | money }}</dd></div>
            </dl>
            <p-button type="submit" size="large" styleClass="mt-6 w-full" [loading]="placing()">
              <fa-icon [icon]="i.check" /> {{ 'co.placeOrder' | t }}
            </p-button>
          </aside>
        </form>
      }
    </div>
  `,
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
    if (user) this.form.controls.shipping.patchValue({ fullName: user.name, phone: user.phone ?? '' });
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
