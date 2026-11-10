import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { CouponService, normalizeCode } from '../../../core/coupon.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../../core/i18n/pipes';
import { Coupon, CouponType } from '../../../core/models';
import { Icons } from '../../../shared/icons';

interface Draft {
  code: string;
  type: CouponType;
  value: number | null;
  minSubtotal: number | null;
  active: boolean;
  expiresAt: Date | null;
}

@Component({
  selector: 'app-admin-coupons',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, FaIconComponent, ButtonModule, DatePickerModule, DialogModule, InputNumberModule, InputTextModule, SelectButtonModule,
    TableModule, TagModule, ToggleSwitchModule, TooltipModule, ...I18N_PIPES,
  ],
  templateUrl: './coupons.html',
  styleUrl: './coupons.css',
})
export class AdminCoupons {
  protected readonly coupons = inject(CouponService);
  private readonly confirm = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  protected readonly i18n = inject(I18nService);
  protected readonly i = Icons;

  protected readonly typeOptions = computed(() => [
    { value: 'percent', label: this.i18n.t('acp.percent') },
    { value: 'fixed', label: this.i18n.t('acp.fixed') },
  ]);

  protected readonly dialogOpen = signal(false);
  protected readonly editing = signal<Coupon | null>(null);
  protected readonly error = signal('');
  protected draft: Draft = this.blank();
  protected readonly today = new Date();

  private blank(): Draft {
    return { code: '', type: 'percent', value: 10, minSubtotal: 0, active: true, expiresAt: null };
  }

  status(c: Coupon): { label: string; severity: 'success' | 'secondary' | 'danger' } {
    if (this.coupons.isExpired(c)) return { label: this.i18n.t('acp.expired'), severity: 'danger' };
    return c.active ? { label: this.i18n.t('acp.active'), severity: 'success' } : { label: this.i18n.t('acp.inactive'), severity: 'secondary' };
  }

  open(c: Coupon | null): void {
    this.editing.set(c);
    this.draft = c
      ? { code: c.code, type: c.type, value: c.value, minSubtotal: c.minSubtotal, active: c.active, expiresAt: c.expiresAt ? new Date(c.expiresAt + 'T00:00:00') : null }
      : this.blank();
    this.error.set('');
    this.dialogOpen.set(true);
  }

  save(): void {
    const d = this.draft;
    const code = normalizeCode(d.code);
    const value = d.value ?? 0;
    if (!/^[A-Z0-9_-]{3,20}$/.test(code) || value <= 0 || (d.type === 'percent' && value > 100)) {
      this.error.set(this.i18n.t('acp.invalid'));
      return;
    }
    const original = this.editing()?.code;
    if (code !== original && this.coupons.find(code)) {
      this.error.set(this.i18n.t('acp.codeTaken'));
      return;
    }
    const exp = d.expiresAt;
    this.coupons.save(
      {
        code,
        type: d.type,
        value,
        minSubtotal: Math.max(0, d.minSubtotal ?? 0),
        active: d.active,
        expiresAt: exp ? `${exp.getFullYear()}-${String(exp.getMonth() + 1).padStart(2, '0')}-${String(exp.getDate()).padStart(2, '0')}` : null,
      },
      original,
    );
    this.toast.add({ severity: 'success', summary: this.i18n.t('toast.couponSaved'), detail: code, life: 2500 });
    this.dialogOpen.set(false);
  }

  remove(c: Coupon): void {
    this.confirm.confirm({
      header: this.i18n.t('acp.deleteTitle'),
      message: this.i18n.t('common.deleteMsg', { name: c.code }),
      acceptLabel: this.i18n.t('common.delete'),
      rejectLabel: this.i18n.t('common.cancel'),
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.coupons.delete(c.code);
        this.toast.add({ severity: 'success', summary: this.i18n.t('toast.couponDeleted'), detail: c.code, life: 2500 });
      },
    });
  }
}
