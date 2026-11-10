import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/auth.service';
import { TranslationKey } from '../../../core/i18n/en';
import { I18nService } from '../../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../../core/i18n/pipes';
import { OrderService } from '../../../core/order.service';
import { ProductService } from '../../../core/product.service';
import { ReviewService } from '../../../core/review.service';
import { Icons } from '../../../shared/icons';
import { StarRating } from '../../../shared/star-rating/star-rating';

@Component({
  selector: 'app-account',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, FaIconComponent, ButtonModule, InputTextModule, MessageModule, PasswordModule, StarRating, ...I18N_PIPES],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account {
  protected readonly auth = inject(AuthService);
  private readonly orders = inject(OrderService);
  private readonly reviewService = inject(ReviewService);
  private readonly products = inject(ProductService);
  private readonly toast = inject(MessageService);
  protected readonly i18n = inject(I18nService);
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly i = Icons;

  protected readonly user = computed(() => this.auth.currentUser()!);
  protected readonly initials = computed(() => this.user().name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase());
  protected readonly stats = computed(() => {
    const mine = this.orders.myOrders().filter((o) => o.status !== 'Cancelled');
    return { orders: mine.length, spent: mine.reduce((s, o) => s + o.total, 0) };
  });
  protected readonly myReviews = computed(() =>
    this.reviewService
      .reviews()
      .filter((r) => r.userId === this.user().id)
      .map((r) => ({ ...r, product: this.products.getById(r.productId) })),
  );

  protected readonly profile = this.fb.group({
    name: [this.user().name, Validators.required],
    phone: [this.user().phone ?? ''],
  });

  protected readonly addressFields = [
    { key: 'fullName', label: 'co.fullName', wide: false },
    { key: 'phone', label: 'co.phone', wide: false },
    { key: 'address', label: 'co.address', wide: true },
    { key: 'city', label: 'co.city', wide: false },
    { key: 'zip', label: 'co.zip', wide: false },
    { key: 'country', label: 'co.country', wide: true },
  ] as const satisfies readonly { key: string; label: TranslationKey; wide: boolean }[];

  protected readonly address = this.fb.group({
    fullName: [this.user().address?.fullName ?? this.user().name, Validators.required],
    phone: [this.user().address?.phone ?? this.user().phone ?? '', Validators.required],
    address: [this.user().address?.address ?? '', Validators.required],
    city: [this.user().address?.city ?? '', Validators.required],
    zip: [this.user().address?.zip ?? '', Validators.required],
    country: [this.user().address?.country ?? '', Validators.required],
  });

  protected readonly password = this.fb.group({
    current: ['', Validators.required],
    next: ['', [Validators.required, Validators.minLength(6)]],
  });
  protected readonly wrongPassword = signal(false);

  saveProfile(): void {
    if (this.profile.invalid) return this.profile.markAllAsTouched();
    this.auth.updateProfile(this.profile.getRawValue());
    this.profile.markAsPristine();
    this.toast.add({ severity: 'success', summary: this.i18n.t('toast.profileSaved'), life: 2500 });
  }

  saveAddress(): void {
    if (this.address.invalid) return this.address.markAllAsTouched();
    this.auth.saveAddress(this.address.getRawValue());
    this.address.markAsPristine();
    this.toast.add({ severity: 'success', summary: this.i18n.t('toast.addressSaved'), life: 2500 });
  }

  changePassword(): void {
    if (this.password.invalid) return this.password.markAllAsTouched();
    const { current, next } = this.password.getRawValue();
    if (!this.auth.changePassword(current, next)) {
      this.wrongPassword.set(true);
      return;
    }
    this.wrongPassword.set(false);
    this.password.reset();
    this.toast.add({ severity: 'success', summary: this.i18n.t('toast.passwordChanged'), life: 2500 });
  }
}
