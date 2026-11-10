import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../../core/i18n/pipes';
import { Icons } from '../../../shared/icons';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, FaIconComponent, ButtonModule, InputTextModule, MessageModule, PasswordModule, ...I18N_PIPES],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly returnUrl = input<string>();
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(MessageService);
  protected readonly i = Icons;
  private readonly i18n = inject(I18nService);
  protected readonly error = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  fill(email: string, password: string): void {
    this.form.setValue({ email, password });
    this.submit();
  }

  submit(): void {
    const { email, password } = this.form.getRawValue();
    if (!this.auth.login(email, password)) {
      this.error.set(true);
      return;
    }
    const user = this.auth.currentUser()!;
    this.toast.add({ severity: 'success', summary: this.i18n.t('toast.welcome', { name: user.name.split(' ')[0] }), life: 2000 });
    this.router.navigateByUrl(this.returnUrl() || (user.role === 'admin' ? '/admin' : '/'));
  }
}
