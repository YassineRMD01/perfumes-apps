import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../core/i18n/pipes';
import { Icons } from '../../shared/icons';

const matchPasswords = (g: AbstractControl): ValidationErrors | null =>
  g.get('password')?.value === g.get('confirm')?.value ? null : { mismatch: true };

@Component({
  selector: 'app-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, FaIconComponent, ButtonModule, InputTextModule, MessageModule, PasswordModule, ...I18N_PIPES],
  template: `
    <div class="container-x flex justify-center py-16">
      <div class="card w-full max-w-md p-8">
        <div class="mb-6 text-center">
          <span class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-xl text-amber-700"><fa-icon [icon]="i.userPlus" /></span>
          <h1 class="mt-4 text-3xl font-bold">{{ 'reg.title' | t }}</h1>
          <p class="text-sm text-stone-500">{{ 'reg.subtitle' | t }}</p>
        </div>

        @if (error()) { <p-message severity="error" styleClass="mb-4">{{ 'reg.exists' | t }}</p-message> }

        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">
          <div>
            <label class="field-label" for="name">{{ 'reg.name' | t }}</label>
            <input pInputText id="name" formControlName="name" class="w-full" [invalid]="bad('name')" />
            @if (bad('name')) { <p class="field-error">{{ 'reg.nameErr' | t }}</p> }
          </div>
          <div>
            <label class="field-label" for="email">{{ 'login.email' | t }}</label>
            <input pInputText id="email" type="email" formControlName="email" class="w-full" [invalid]="bad('email')" dir="ltr" />
            @if (bad('email')) { <p class="field-error">{{ 'reg.emailErr' | t }}</p> }
          </div>
          <div>
            <label class="field-label" for="phone">{{ 'reg.phone' | t }}</label>
            <input pInputText id="phone" formControlName="phone" class="w-full" dir="ltr" />
          </div>
          <div>
            <label class="field-label" for="password">{{ 'login.password' | t }}</label>
            <p-password inputId="password" formControlName="password" [toggleMask]="true" [fluid]="true" />
            @if (bad('password')) { <p class="field-error">{{ 'reg.passwordErr' | t }}</p> }
          </div>
          <div>
            <label class="field-label" for="confirm">{{ 'reg.confirm' | t }}</label>
            <p-password inputId="confirm" formControlName="confirm" [feedback]="false" [toggleMask]="true" [fluid]="true" />
            @if (form.hasError('mismatch') && form.controls.confirm.touched) { <p class="field-error">{{ 'reg.mismatch' | t }}</p> }
          </div>
          <p-button type="submit" styleClass="w-full">{{ 'reg.submit' | t }}</p-button>
        </form>

        <p class="mt-6 text-center text-sm text-stone-500">
          {{ 'reg.have' | t }} <a routerLink="/login" [queryParams]="{ returnUrl: returnUrl() }" class="font-semibold text-amber-700 hover:underline">{{ 'login.submit' | t }}</a>
        </p>
      </div>
    </div>
  `,
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
    this.toast.add({ severity: 'success', summary: this.i18n.t('toast.accountCreated'), detail: this.i18n.t('toast.welcomeEssence'), life: 2500 });
    this.router.navigateByUrl(this.returnUrl() || '/');
  }
}
