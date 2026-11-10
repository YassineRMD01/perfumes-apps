import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { I18nService } from './core/i18n/i18n.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, ConfirmDialogModule],
  template: `
    <router-outlet />
    <p-toast [position]="i18n.isRtl() ? 'top-left' : 'top-right'" />
    <p-confirmdialog />
  `,
})
export class App {
  // Injecting the service here applies lang/dir to <html> on startup
  protected readonly i18n = inject(I18nService);
}
