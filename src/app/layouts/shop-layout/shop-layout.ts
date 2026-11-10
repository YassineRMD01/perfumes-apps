import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MenuItem, MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../../core/auth.service';
import { CartService } from '../../core/cart.service';
import { CurrencyService } from '../../core/currency.service';
import { TranslationKey } from '../../core/i18n/en';
import { I18nService, LANGUAGES } from '../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../core/i18n/pipes';
import { CURRENCIES } from '../../core/models';
import { ThemeService } from '../../core/theme.service';
import { WishlistService } from '../../core/wishlist.service';
import { CurrencySwitcher } from '../../shared/currency-switcher/currency-switcher';
import { Icons } from '../../shared/icons';
import { LanguageSwitcher } from '../../shared/language-switcher/language-switcher';
import { Logo } from '../../shared/logo/logo';
import { ThemeToggle } from '../../shared/theme-toggle/theme-toggle';

@Component({
  selector: 'app-shop-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive, FormsModule, FaIconComponent, AvatarModule, BadgeModule, ButtonModule,
    DrawerModule, IconFieldModule, InputIconModule, InputTextModule, MenuModule,
    Logo, LanguageSwitcher, CurrencySwitcher, ThemeToggle, ...I18N_PIPES,
  ],
  templateUrl: './shop-layout.html',
  styleUrl: './shop-layout.css',
})
export class ShopLayout {
  protected readonly auth = inject(AuthService);
  protected readonly cart = inject(CartService);
  protected readonly wishlist = inject(WishlistService);
  protected readonly i18n = inject(I18nService);
  protected readonly currency = inject(CurrencyService);
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly toast = inject(MessageService);
  protected readonly i = Icons;
  protected readonly year = new Date().getFullYear();
  protected readonly languages = LANGUAGES;
  protected readonly currencies = CURRENCIES;
  protected readonly socials = [Icons.instagram, Icons.facebook, Icons.pinterest, Icons.tiktok];

  protected query = '';
  protected readonly mobileOpen = signal(false);

  protected readonly links: { label: TranslationKey; path: string; query?: Record<string, string> }[] = [
    { label: 'nav.home', path: '/' },
    { label: 'nav.shopAll', path: '/shop' },
    { label: 'nav.women', path: '/shop', query: { gender: 'Women' } },
    { label: 'nav.men', path: '/shop', query: { gender: 'Men' } },
    { label: 'nav.unisex', path: '/shop', query: { gender: 'Unisex' } },
  ];

  protected readonly initials = computed(() =>
    (this.auth.currentUser()?.name ?? '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase(),
  );

  protected readonly menuItems = computed<MenuItem[]>(() => [
    { label: this.auth.currentUser()?.email, disabled: true },
    { separator: true },
    ...(this.auth.isAdmin() ? [{ label: this.i18n.t('nav.adminPanel'), routerLink: '/admin' }] : []),
    { label: this.i18n.t('nav.myOrders'), routerLink: '/orders' },
    { label: this.i18n.t('nav.wishlist'), routerLink: '/wishlist' },
    { separator: true },
    { label: this.i18n.t('nav.signOut'), command: () => this.logout() },
  ]);

  search(): void {
    this.router.navigate(['/shop'], { queryParams: this.query.trim() ? { q: this.query.trim() } : {} });
  }

  logout(): void {
    this.auth.logout();
    this.toast.add({ severity: 'info', summary: this.i18n.t('toast.signedOut'), detail: this.i18n.t('toast.seeYouSoon'), life: 2000 });
    this.router.navigate(['/']);
  }
}
