import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../core/auth.service';
import { resetDemoData } from '../core/storage';
import { Icons } from '../shared/icons';

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FaIconComponent, AvatarModule, ButtonModule, TooltipModule],
  template: `
    <div class="flex min-h-screen bg-stone-100">
      <!-- Backdrop on mobile -->
      @if (sidebarOpen()) {
        <div class="fixed inset-0 z-40 bg-black/40 lg:hidden" (click)="sidebarOpen.set(false)"></div>
      }

      <aside class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-stone-900 p-4 transition-transform lg:static lg:translate-x-0"
             [class.-translate-x-full]="!sidebarOpen()">
        <a routerLink="/admin" class="mb-8 flex items-center gap-2 px-2 pt-2 text-white">
          <span class="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-amber-700">
            <fa-icon [icon]="i.spray" />
          </span>
          <div class="leading-tight">
            <div class="font-display text-xl font-bold">Essence</div>
            <div class="text-[10px] uppercase tracking-[0.2em] text-amber-400">Admin console</div>
          </div>
        </a>

        <nav class="flex flex-col gap-1">
          @for (l of links; track l.path) {
            <a [routerLink]="l.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: l.exact }"
               class="admin-link" (click)="sidebarOpen.set(false)">
              <fa-icon [icon]="l.icon" class="w-5" />{{ l.label }}
            </a>
          }
        </nav>

        <div class="mt-auto flex flex-col gap-1 border-t border-stone-800 pt-4">
          <a routerLink="/" class="admin-link"><fa-icon [icon]="i.store" class="w-5" />View storefront</a>
          <button class="admin-link text-left" (click)="resetData()"><fa-icon [icon]="i.reset" class="w-5" />Reset demo data</button>
          <button class="admin-link text-left" (click)="logout()"><fa-icon [icon]="i.logout" class="w-5" />Sign out</button>
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <header class="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-stone-200 bg-white px-4 sm:px-6">
          <button class="text-xl text-stone-700 lg:hidden" (click)="sidebarOpen.set(true)" aria-label="Open menu">
            <fa-icon [icon]="i.bars" />
          </button>
          <h1 class="font-display text-lg font-semibold">Back office</h1>
          <div class="ml-auto flex items-center gap-3">
            <div class="hidden text-right sm:block">
              <div class="text-sm font-medium">{{ auth.currentUser()?.name }}</div>
              <div class="text-xs text-stone-500">{{ auth.currentUser()?.email }}</div>
            </div>
            <p-avatar label="A" shape="circle" class="!bg-amber-600 !text-white" />
          </div>
        </header>
        <main class="flex-1 p-4 sm:p-6 lg:p-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AdminLayout {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  protected readonly i = Icons;
  protected readonly sidebarOpen = signal(false);

  protected readonly links = [
    { label: 'Dashboard', path: '/admin', icon: Icons.gauge, exact: true },
    { label: 'Products', path: '/admin/products', icon: Icons.boxes, exact: false },
    { label: 'Orders', path: '/admin/orders', icon: Icons.receipt, exact: false },
    { label: 'Customers', path: '/admin/customers', icon: Icons.users, exact: false },
  ];

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  resetData(): void {
    this.confirm.confirm({
      header: 'Reset demo data?',
      message: 'All products, orders, users and carts will be restored to their initial state.',
      acceptLabel: 'Reset',
      rejectLabel: 'Cancel',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        resetDemoData();
        this.toast.add({ severity: 'success', summary: 'Demo data reset', life: 1500 });
        setTimeout(() => (window.location.href = '/'), 600);
      },
    });
  }
}
