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
import { AuthService } from '../core/auth.service';
import { CartService, FREE_SHIPPING_THRESHOLD } from '../core/cart.service';
import { I18nService, LANGUAGES } from '../core/i18n/i18n.service';
import { TranslationKey } from '../core/i18n/en';
import { I18N_PIPES } from '../core/i18n/pipes';
import { WishlistService } from '../core/wishlist.service';
import { Icons } from '../shared/icons';
import { LanguageSwitcher } from '../shared/language-switcher';

@Component({
  selector: 'app-shop-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive, FormsModule, FaIconComponent, AvatarModule, BadgeModule, ButtonModule,
    DrawerModule, IconFieldModule, InputIconModule, InputTextModule, MenuModule, LanguageSwitcher, ...I18N_PIPES,
  ],
  template: `
    <div class="flex min-h-screen flex-col">
      <div class="bg-stone-900 px-4 py-2 text-center text-xs tracking-wide text-stone-200">
        <fa-icon [icon]="i.truck" class="me-2 text-amber-400" />
        {{ 'announce' | t: { amount: (freeShipping | money: true) } }}
      </div>

      <header class="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div class="container-x flex h-16 items-center gap-3">
          <button class="text-xl text-stone-700 lg:hidden" (click)="mobileOpen.set(true)" [attr.aria-label]="'nav.openMenu' | t">
            <fa-icon [icon]="i.bars" />
          </button>

          <a routerLink="/" class="flex items-center gap-2" dir="ltr">
            <span class="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-amber-700 text-white">
              <fa-icon [icon]="i.spray" />
            </span>
            <span class="font-display hidden text-2xl font-bold tracking-tight sm:inline" style="font-family: var(--font-serif)">Essence</span>
          </a>

          <nav class="ms-6 hidden items-center gap-6 lg:flex">
            @for (l of links; track l.label) {
              <a class="nav-link" [routerLink]="l.path" [queryParams]="l.query" routerLinkActive="active"
                 [routerLinkActiveOptions]="{ exact: true }">{{ l.label | t }}</a>
            }
          </nav>

          <form class="ms-auto hidden md:block" (ngSubmit)="search()">
            <p-iconfield>
              <p-inputicon><fa-icon [icon]="i.search" class="text-stone-400" /></p-inputicon>
              <input pInputText name="q" [(ngModel)]="query" [placeholder]="'nav.search' | t" class="w-52 lg:w-64" />
            </p-iconfield>
          </form>

          <div class="ms-auto flex items-center gap-0.5 md:ms-1">
            <app-language-switcher class="hidden sm:block" />
            <a routerLink="/wishlist" class="relative grid h-10 w-10 place-items-center rounded-full text-lg text-stone-700 hover:bg-stone-100"
               [attr.aria-label]="'nav.wishlist' | t">
              <fa-icon [icon]="i.heartOutline" />
              @if (wishlist.count()) {
                <p-badge [value]="wishlist.count()" severity="danger" class="absolute -end-0.5 -top-0.5" />
              }
            </a>
            <a routerLink="/cart" class="relative grid h-10 w-10 place-items-center rounded-full text-lg text-stone-700 hover:bg-stone-100"
               [attr.aria-label]="'nav.cart' | t">
              <fa-icon [icon]="i.bag" />
              @if (cart.count()) {
                <p-badge [value]="cart.count()" class="absolute -end-0.5 -top-0.5" />
              }
            </a>

            @if (auth.currentUser(); as user) {
              <button class="ms-1 flex items-center gap-2 rounded-full py-1 pe-3 ps-1 hover:bg-stone-100" (click)="userMenu.toggle($event)">
                <p-avatar [label]="initials()" shape="circle" class="!bg-amber-100 !text-amber-800" />
                <span class="hidden text-sm font-medium sm:inline">{{ user.name.split(' ')[0] }}</span>
              </button>
              <p-menu #userMenu [model]="menuItems()" [popup]="true" appendTo="body" />
            } @else {
              <p-button routerLink="/login" size="small" [text]="true" class="ms-1">
                <fa-icon [icon]="i.user" /><span class="hidden sm:inline">{{ 'nav.signIn' | t }}</span>
              </p-button>
            }
          </div>
        </div>
      </header>

      <p-drawer [(visible)]="mobileOpen" header="Essence" styleClass="!w-72" [position]="i18n.isRtl() ? 'right' : 'left'">
        <form class="mb-6" (ngSubmit)="search(); mobileOpen.set(false)">
          <p-iconfield>
            <p-inputicon><fa-icon [icon]="i.search" class="text-stone-400" /></p-inputicon>
            <input pInputText name="qm" [(ngModel)]="query" [placeholder]="'nav.search' | t" class="w-full" />
          </p-iconfield>
        </form>
        <nav class="flex flex-col gap-4">
          @for (l of links; track l.label) {
            <a class="nav-link text-base" [routerLink]="l.path" [queryParams]="l.query" (click)="mobileOpen.set(false)">{{ l.label | t }}</a>
          }
          @if (auth.isAdmin()) {
            <a class="nav-link text-base" routerLink="/admin" (click)="mobileOpen.set(false)">{{ 'nav.adminPanel' | t }}</a>
          }
        </nav>
        <div class="mt-8 border-t border-stone-200 pt-5">
          <div class="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-stone-500">
            <fa-icon [icon]="i.globe" /> {{ 'common.language' | t }}
          </div>
          <div class="grid grid-cols-2 gap-2">
            @for (l of languages; track l.code) {
              <button type="button" (click)="i18n.use(l.code)" [attr.lang]="l.code"
                      class="rounded-lg border px-3 py-2 text-sm transition"
                      [class.border-amber-500]="l.code === i18n.lang()" [class.bg-amber-50]="l.code === i18n.lang()"
                      [class.border-stone-200]="l.code !== i18n.lang()">{{ l.label }}</button>
            }
          </div>
        </div>
      </p-drawer>

      <main class="flex-1">
        <router-outlet />
      </main>

      <footer class="mt-16 bg-stone-900 text-stone-300">
        <div class="container-x grid gap-10 py-14 md:grid-cols-4">
          <div class="md:col-span-2">
            <div class="flex items-center gap-2 text-white" dir="ltr">
              <fa-icon [icon]="i.spray" class="text-amber-400" />
              <span class="text-2xl font-bold" style="font-family: var(--font-serif)">Essence</span>
            </div>
            <p class="mt-3 max-w-sm text-sm text-stone-400">{{ 'footer.tagline' | t }}</p>
            <div class="mt-5 flex gap-3">
              @for (s of socials; track $index) {
                <a href="#" class="grid h-9 w-9 place-items-center rounded-full bg-stone-800 hover:bg-amber-600 hover:text-white">
                  <fa-icon [icon]="s" />
                </a>
              }
            </div>
          </div>
          <div>
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-widest text-white">{{ 'footer.shop' | t }}</h4>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/shop" [queryParams]="{ gender: 'Women' }" class="hover:text-amber-400">{{ 'nav.women' | t }}</a></li>
              <li><a routerLink="/shop" [queryParams]="{ gender: 'Men' }" class="hover:text-amber-400">{{ 'nav.men' | t }}</a></li>
              <li><a routerLink="/shop" [queryParams]="{ gender: 'Unisex' }" class="hover:text-amber-400">{{ 'nav.unisex' | t }}</a></li>
            </ul>
          </div>
          <div>
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-widest text-white">{{ 'footer.account' | t }}</h4>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/orders" class="hover:text-amber-400">{{ 'nav.myOrders' | t }}</a></li>
              <li><a routerLink="/wishlist" class="hover:text-amber-400">{{ 'nav.wishlist' | t }}</a></li>
              <li><a routerLink="/cart" class="hover:text-amber-400">{{ 'nav.cart' | t }}</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-stone-800 py-5 text-center text-xs text-stone-500">
          {{ 'footer.rights' | t: { year } }}
        </div>
      </footer>
    </div>
  `,
})
export class ShopLayout {
  protected readonly auth = inject(AuthService);
  protected readonly cart = inject(CartService);
  protected readonly wishlist = inject(WishlistService);
  protected readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  private readonly toast = inject(MessageService);
  protected readonly i = Icons;
  protected readonly year = new Date().getFullYear();
  protected readonly freeShipping = FREE_SHIPPING_THRESHOLD;
  protected readonly languages = LANGUAGES;
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
