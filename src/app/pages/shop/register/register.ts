import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
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

const matchPasswords = (g: AbstractControl): ValidationErrors | null =>
  g.get('password')?.value === g.get('confirm')?.value ? null : { mismatch: true };

@Component({
  selector: 'app-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, FaIconComponent, ButtonModule, InputTextModule, MessageModule, PasswordModule, ...I18N_PIPES],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  readonly returnUrl = input<string>();
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(MessageService);
  protected readonly i = Icons;
  private readonly i18n = inject(I18nService);
  protected readonly error = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group(
    {
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', Validators.required],
    },
    { validators: matchPasswords },
  );

  bad(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && c.touched;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { confirm: _, ...data } = this.form.getRawValue();
    const res = this.auth.register(data);
    if (!res.ok) {
      this.error.set(true);
      return;
    }
    this.toast.add({ severity: 'success', summary: this.i18n.t('toast.accountCreated'), detail: this.i18n.t('toast.welcomeStore'), life: 2500 });
    this.router.navigateByUrl(this.returnUrl() || '/');
  }
}
