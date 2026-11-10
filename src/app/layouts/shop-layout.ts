import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MenuItem, MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '../core/auth.service';
import { CartService } from '../core/cart.service';
import { WishlistService } from '../core/wishlist.service';
import { Icons } from '../shared/icons';

@Component({
  selector: 'app-shop-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive, FormsModule, FaIconComponent, BadgeModule, ButtonModule,
    DrawerModule, IconFieldModule, InputIconModule, InputTextModule, MenuModule, AvatarModule,
  ],
  template: `
    <div class="flex min-h-screen flex-col">
      <!-- Announcement bar -->
      <div class="bg-stone-900 py-2 text-center text-xs tracking-wide text-stone-200">
        <fa-icon [icon]="i.truck" class="mr-2 text-amber-400" />
        Free shipping on orders over $150 · Complimentary samples with every order
      </div>

      <header class="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div class="container-x flex h-16 items-center gap-4">
          <button class="text-xl text-stone-700 lg:hidden" (click)="mobileOpen.set(true)" aria-label="Open menu">
            <fa-icon [icon]="i.bars" />
          </button>

          <a routerLink="/" class="flex items-center gap-2">
            <span class="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-amber-700 text-white">
              <fa-icon [icon]="i.spray" />
            </span>
            <span class="font-display text-2xl font-bold tracking-tight">Essence</span>
          </a>

          <nav class="ml-8 hidden items-center gap-6 lg:flex">
            @for (l of links; track l.label) {
              <a class="nav-link" [routerLink]="l.path" [queryParams]="l.query" routerLinkActive="active"
                 [routerLinkActiveOptions]="{ exact: true }">{{ l.label }}</a>
            }
          </nav>

          <form class="ml-auto hidden md:block" (ngSubmit)="search()">
            <p-iconfield>
              <p-inputicon><fa-icon [icon]="i.search" class="text-stone-400" /></p-inputicon>
              <input pInputText name="q" [(ngModel)]="query" placeholder="Search perfumes…" class="w-56 lg:w-72" />
            </p-iconfield>
          </form>

          <div class="ml-auto flex items-center gap-1 md:ml-2">
            <a routerLink="/wishlist" class="relative grid h-10 w-10 place-items-center rounded-full text-lg text-stone-700 hover:bg-stone-100"
               aria-label="Wishlist">
              <fa-icon [icon]="i.heartOutline" />
              @if (wishlist.count()) {
                <p-badge [value]="wishlist.count()" severity="danger" class="absolute -right-0.5 -top-0.5" />
              }
            </a>
            <a routerLink="/cart" class="relative grid h-10 w-10 place-items-center rounded-full text-lg text-stone-700 hover:bg-stone-100"
               aria-label="Cart">
              <fa-icon [icon]="i.bag" />
              @if (cart.count()) {
                <p-badge [value]="cart.count()" class="absolute -right-0.5 -top-0.5" />
              }
            </a>

            @if (auth.currentUser(); as user) {
              <button class="ml-1 flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-stone-100" (click)="userMenu.toggle($event)">
                <p-avatar [label]="initials()" shape="circle" class="!bg-amber-100 !text-amber-800" />
                <span class="hidden text-sm font-medium sm:inline">{{ user.name.split(' ')[0] }}</span>
              </button>
              <p-menu #userMenu [model]="menuItems()" [popup]="true" appendTo="body" />
            } @else {
              <p-button routerLink="/login" size="small" [text]="true" class="ml-1">
                <fa-icon [icon]="i.user" /><span class="hidden sm:inline">Sign in</span>
              </p-button>
            }
          </div>
        </div>
      </header>

      <!-- Mobile drawer -->
      <p-drawer [(visible)]="mobileOpen" header="Essence" styleClass="!w-72">
        <form class="mb-6" (ngSubmit)="search(); mobileOpen.set(false)">
          <p-iconfield>
            <p-inputicon><fa-icon [icon]="i.search" class="text-stone-400" /></p-inputicon>
            <input pInputText name="qm" [(ngModel)]="query" placeholder="Search perfumes…" class="w-full" />
          </p-iconfield>
        </form>
        <nav class="flex flex-col gap-4">
          @for (l of links; track l.label) {
            <a class="nav-link text-base" [routerLink]="l.path" [queryParams]="l.query" (click)="mobileOpen.set(false)">{{ l.label }}</a>
          }
          @if (auth.isAdmin()) {
            <a class="nav-link text-base" routerLink="/admin" (click)="mobileOpen.set(false)">Admin panel</a>
          }
        </nav>
      </p-drawer>

      <main class="flex-1">
        <router-outlet />
      </main>

      <footer class="mt-16 bg-stone-900 text-stone-300">
        <div class="container-x grid gap-10 py-14 md:grid-cols-4">
          <div class="md:col-span-2">
            <div class="flex items-center gap-2 text-white">
              <fa-icon [icon]="i.spray" class="text-amber-400" />
              <span class="font-display text-2xl font-bold">Essence</span>
            </div>
            <p class="mt-3 max-w-sm text-sm text-stone-400">
              Curated niche and designer fragrances, delivered to your door. 100% authentic, beautifully wrapped.
            </p>
            <div class="mt-5 flex gap-3">
              @for (s of socials; track $index) {
                <a href="#" class="grid h-9 w-9 place-items-center rounded-full bg-stone-800 hover:bg-amber-600 hover:text-white">
                  <fa-icon [icon]="s" />
                </a>
              }
            </div>
          </div>
          <div>
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-widest text-white">Shop</h4>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/shop" [queryParams]="{ gender: 'Women' }" class="hover:text-amber-400">Women</a></li>
              <li><a routerLink="/shop" [queryParams]="{ gender: 'Men' }" class="hover:text-amber-400">Men</a></li>
              <li><a routerLink="/shop" [queryParams]="{ gender: 'Unisex' }" class="hover:text-amber-400">Unisex</a></li>
            </ul>
          </div>
          <div>
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-widest text-white">Account</h4>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/orders" class="hover:text-amber-400">My orders</a></li>
              <li><a routerLink="/wishlist" class="hover:text-amber-400">Wishlist</a></li>
              <li><a routerLink="/cart" class="hover:text-amber-400">Cart</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-stone-800 py-5 text-center text-xs text-stone-500">
          © {{ year }} Essence Parfumerie · Demo storefront
        </div>
      </footer>
    </div>
  `,
})
export class ShopLayout {
  protected readonly auth = inject(AuthService);
  protected readonly cart = inject(CartService);
  protected readonly wishlist = inject(WishlistService);
  private readonly router = inject(Router);
  private readonly toast = inject(MessageService);
  protected readonly i = Icons;
  protected readonly year = new Date().getFullYear();
  protected readonly socials = [Icons.instagram, Icons.facebook, Icons.pinterest, Icons.tiktok];

  protected query = '';
  protected readonly mobileOpen = signal(false);

  protected readonly links = [
    { label: 'Home', path: '/', query: undefined },
    { label: 'Shop all', path: '/shop', query: undefined },
    { label: 'Women', path: '/shop', query: { gender: 'Women' } },
    { label: 'Men', path: '/shop', query: { gender: 'Men' } },
    { label: 'Unisex', path: '/shop', query: { gender: 'Unisex' } },
  ];

  protected readonly initials = computed(() =>
    (this.auth.currentUser()?.name ?? '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase(),
  );

  protected readonly menuItems = computed<MenuItem[]>(() => [
    { label: this.auth.currentUser()?.email, disabled: true },
    { separator: true },
    ...(this.auth.isAdmin() ? [{ label: 'Admin panel', routerLink: '/admin' }] : []),
    { label: 'My orders', routerLink: '/orders' },
    { label: 'Wishlist', routerLink: '/wishlist' },
    { separator: true },
    { label: 'Sign out', command: () => this.logout() },
  ]);

  search(): void {
    this.router.navigate(['/shop'], { queryParams: this.query.trim() ? { q: this.query.trim() } : {} });
  }

  logout(): void {
    this.auth.logout();
    this.toast.add({ severity: 'info', summary: 'Signed out', detail: 'See you soon!', life: 2000 });
    this.router.navigate(['/']);
  }
}
