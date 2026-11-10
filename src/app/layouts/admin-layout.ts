import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '../core/auth.service';
import { TranslationKey } from '../core/i18n/en';
import { I18nService } from '../core/i18n/i18n.service';
import { I18N_PIPES } from '../core/i18n/pipes';
import { resetDemoData } from '../core/storage';
import { Icons } from '../shared/icons';
import { LanguageSwitcher } from '../shared/language-switcher';

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FaIconComponent, AvatarModule, LanguageSwitcher, ...I18N_PIPES],
  template: `
    <div class="flex min-h-screen bg-stone-100">
      @if (sidebarOpen()) {
        <div class="fixed inset-0 z-40 bg-black/40 lg:hidden" (click)="sidebarOpen.set(false)"></div>
      }

      <aside class="fixed inset-y-0 start-0 z-50 w-64 flex-col bg-stone-900 p-4 lg:static lg:flex"
             [class.flex]="sidebarOpen()" [class.hidden]="!sidebarOpen()">
        <a routerLink="/admin" class="mb-8 flex items-center gap-2 px-2 pt-2 text-white">
          <span class="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-amber-700">
            <fa-icon [icon]="i.spray" />
          </span>
          <div class="leading-tight">
            <div class="text-xl font-bold" style="font-family: var(--font-serif)">Essence</div>
            <div class="text-[10px] uppercase tracking-[0.2em] text-amber-400">{{ 'admin.console' | t }}</div>
          </div>
        </a>

        <nav class="flex flex-col gap-1">
          @for (l of links; track l.path) {
            <a [routerLink]="l.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: l.exact }"
               class="admin-link" (click)="sidebarOpen.set(false)">
              <fa-icon [icon]="l.icon" class="w-5" />{{ l.label | t }}
            </a>
          }
        </nav>

        <div class="mt-auto flex flex-col gap-1 border-t border-stone-800 pt-4">
          <a routerLink="/" class="admin-link"><fa-icon [icon]="i.store" class="w-5" />{{ 'admin.viewStore' | t }}</a>
          <button class="admin-link text-start" (click)="resetData()"><fa-icon [icon]="i.reset" class="w-5" />{{ 'admin.reset' | t }}</button>
          <button class="admin-link text-start" (click)="logout()"><fa-icon [icon]="i.logout" class="w-5 rtl:-scale-x-100" />{{ 'nav.signOut' | t }}</button>
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <header class="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-stone-200 bg-white px-4 sm:px-6">
          <button class="text-xl text-stone-700 lg:hidden" (click)="sidebarOpen.set(true)" [attr.aria-label]="'nav.openMenu' | t">
            <fa-icon [icon]="i.bars" />
          </button>
          <h1 class="text-lg font-semibold">{{ 'admin.backOffice' | t }}</h1>
          <div class="ms-auto flex items-center gap-3">
            <app-language-switcher />
            <div class="hidden text-end sm:block">
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
  private readonly i18n = inject(I18nService);
  protected readonly i = Icons;
  protected readonly sidebarOpen = signal(false);

  protected readonly links: { label: TranslationKey; path: string; icon: typeof Icons.gauge; exact: boolean }[] = [
    { label: 'admin.dashboard', path: '/admin', icon: Icons.gauge, exact: true },
    { label: 'admin.products', path: '/admin/products', icon: Icons.boxes, exact: false },
    { label: 'admin.orders', path: '/admin/orders', icon: Icons.receipt, exact: false },
    { label: 'admin.customers', path: '/admin/customers', icon: Icons.users, exact: false },
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
