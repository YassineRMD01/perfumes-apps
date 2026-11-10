import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '../../core/auth.service';
import { TranslationKey } from '../../core/i18n/en';
import { I18nService } from '../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../core/i18n/pipes';
import { resetDemoData } from '../../core/storage';
import { Icons } from '../../shared/icons';
import { CurrencySwitcher } from '../../shared/currency-switcher/currency-switcher';
import { LanguageSwitcher } from '../../shared/language-switcher/language-switcher';
import { Logo } from '../../shared/logo/logo';
import { ThemeToggle } from '../../shared/theme-toggle/theme-toggle';

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FaIconComponent, AvatarModule, Logo, LanguageSwitcher, CurrencySwitcher, ThemeToggle, ...I18N_PIPES],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  private readonly i18n = inject(I18nService);
  protected readonly i = Icons;
  protected readonly sidebarOpen = signal(false);

  protected readonly links: { label: TranslationKey; path: string; icon: typeof Icons.gauge; exact: boolean }[] = [
    { label: 'admin.dashboard', path: '/admin', icon: Icons.gauge, exact: true },
    { label: 'admin.products', path: '/admin/products', icon: Icons.boxes, exact: false },
    { label: 'admin.orders', path: '/admin/orders', icon: Icons.receipt, exact: false },
    { label: 'admin.customers', path: '/admin/customers', icon: Icons.users, exact: false },
  ];

  protected readonly catalogLinks: { label: TranslationKey; path: string; icon: typeof Icons.gauge; exact: boolean }[] = [
    { label: 'admin.brands', path: '/admin/brands', icon: Icons.tags, exact: false },
    { label: 'admin.categories', path: '/admin/categories', icon: Icons.layers, exact: false },
    { label: 'admin.settings', path: '/admin/settings', icon: Icons.gear, exact: false },
  ];

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  resetData(): void {
    this.confirm.confirm({
      header: this.i18n.t('admin.resetTitle'),
      message: this.i18n.t('admin.resetMsg'),
      acceptLabel: this.i18n.t('admin.resetBtn'),
      rejectLabel: this.i18n.t('common.cancel'),
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        resetDemoData();
        this.toast.add({ severity: 'success', summary: this.i18n.t('toast.resetDone'), life: 1500 });
        setTimeout(() => (window.location.href = '/'), 600);
      },
    });
  }
}
