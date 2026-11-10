import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
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
import { PaymentMethod } from '../../core/models';
import { OrderService } from '../../core/order.service';
import { Bottle } from '../../shared/bottle';
import { Icons } from '../../shared/icons';

@Component({
  selector: 'app-checkout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink, FaIconComponent, ButtonModule, InputMaskModule, InputTextModule, SelectButtonModule, Bottle],
  template: `
    <div class="container-x py-10">
      <h1 class="mb-8 text-4xl font-bold">Checkout</h1>

      @if (cart.isEmpty()) {
        <div class="card py-16 text-center">
          <p class="text-stone-500">Your bag is empty.</p>
          <p-button class="mt-4 inline-block" routerLink="/shop">Go shopping</p-button>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="placeOrder()" class="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div class="flex flex-col gap-6">
            <section class="card p-6" formGroupName="shipping">
              <h2 class="mb-5 flex items-center gap-2 text-xl font-semibold"><fa-icon [icon]="i.truck" class="text-amber-700" /> Shipping details</h2>
              <div class="grid gap-4 sm:grid-cols-2">
                @for (f of shippingFields; track f.key) {
                  <div [class.sm:col-span-2]="f.wide">
                    <label class="field-label" [for]="f.key">{{ f.label }}</label>
                    <input pInputText [id]="f.key" [formControlName]="f.key" class="w-full" [invalid]="invalid('shipping.' + f.key)" />
                    @if (invalid('shipping.' + f.key)) { <p class="field-error">{{ f.label }} is required</p> }
                  </div>
                }
              </div>
            </section>

            <section class="card p-6">
              <h2 class="mb-5 flex items-center gap-2 text-xl font-semibold"><fa-icon [icon]="i.card" class="text-amber-700" /> Payment</h2>
              <p-selectbutton [options]="paymentOptions" formControlName="payment" optionLabel="label" optionValue="value" [allowEmpty]="false" />
              @if (form.controls.payment.value === 'Card') {
                <div class="mt-5 grid gap-4 sm:grid-cols-2" formGroupName="card">
                  <div class="sm:col-span-2">
                    <label class="field-label">Card number</label>
                    <p-inputmask mask="9999 9999 9999 9999" formControlName="number" placeholder="4242 4242 4242 4242" styleClass="w-full" />
                  </div>
                  <div>
                    <label class="field-label">Expiry</label>
                    <p-inputmask mask="99/99" formControlName="expiry" placeholder="MM/YY" styleClass="w-full" />
                  </div>
                  <div>
                    <label class="field-label">CVC</label>
                    <p-inputmask mask="999" formControlName="cvc" placeholder="123" styleClass="w-full" />
                  </div>
                  @if (submitted() && form.controls.card.invalid) {
                    <p class="field-error sm:col-span-2">Please complete your card details.</p>
                  }
                  <p class="text-xs text-stone-500 sm:col-span-2"><fa-icon [icon]="i.lock" /> Demo only — no real payment is processed.</p>
                </div>
              } @else {
                <p class="mt-4 text-sm text-stone-600"><fa-icon [icon]="i.cash" class="text-emerald-600" /> Pay in cash when your order arrives.</p>
              }
            </section>
          </div>

          <aside class="card h-fit p-6 lg:sticky lg:top-24">
            <h2 class="mb-4 text-xl font-semibold">Your order</h2>
            <ul class="mb-4 space-y-3">
              @for (l of cart.lines(); track l.product.id) {
                <li class="flex items-center gap-3">
                  <div class="flex h-14 w-12 items-center justify-center rounded-lg bg-stone-100 p-1">
                    <app-bottle class="h-full" [color]="l.product.color" [name]="l.product.name" [brand]="l.product.brand" [imageUrl]="l.product.imageUrl" />
                  </div>
                  <div class="flex-1 text-sm">
                    <div class="font-medium">{{ l.product.name }}</div>
                    <div class="text-xs text-stone-500">Qty {{ l.qty }}</div>
                  </div>
                  <div class="text-sm font-semibold">{{ l.lineTotal | currency }}</div>
                </li>
              }
            </ul>
            <dl class="space-y-2 border-t border-stone-200 pt-4 text-sm">
              <div class="flex justify-between"><dt class="text-stone-500">Subtotal</dt><dd>{{ cart.subtotal() | currency }}</dd></div>
              <div class="flex justify-between"><dt class="text-stone-500">Shipping</dt><dd>{{ cart.shipping() ? (cart.shipping() | currency) : 'Free' }}</dd></div>
              <div class="flex justify-between pt-2 text-lg font-bold"><dt>Total</dt><dd>{{ cart.total() | currency }}</dd></div>
            </dl>
            <p-button type="submit" size="large" styleClass="mt-6 w-full" [loading]="placing()">
              <fa-icon [icon]="i.check" /> Place order
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
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly i = Icons;
  protected readonly submitted = signal(false);
  protected readonly placing = signal(false);

  protected readonly shippingFields = [
    { key: 'fullName', label: 'Full name', wide: false },
    { key: 'phone', label: 'Phone', wide: false },
    { key: 'address', label: 'Address', wide: true },
    { key: 'city', label: 'City', wide: false },
    { key: 'zip', label: 'Postal code', wide: false },
    { key: 'country', label: 'Country', wide: true },
  ] as const;

  protected readonly paymentOptions: { label: string; value: PaymentMethod }[] = [
    { label: 'Credit card', value: 'Card' },
    { label: 'Cash on delivery', value: 'Cash on delivery' },
  ];

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
      this.toast.add({ severity: 'warn', summary: 'Please complete the form', life: 2500 });
      return;
    }
    this.placing.set(true);
    // Simulate a payment round-trip
    setTimeout(() => {
      const v = this.form.getRawValue();
      const order = this.orders.place(v.shipping, v.payment);
      this.placing.set(false);
      this.toast.add({ severity: 'success', summary: 'Order placed!', detail: `Order ${order.id} is confirmed.`, life: 4000 });
      this.router.navigate(['/orders'], { queryParams: { placed: order.id } });
    }, 700);
  }
}
