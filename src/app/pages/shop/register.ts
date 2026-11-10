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
import { Icons } from '../../shared/icons';

const matchPasswords = (g: AbstractControl): ValidationErrors | null =>
  g.get('password')?.value === g.get('confirm')?.value ? null : { mismatch: true };

@Component({
  selector: 'app-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, FaIconComponent, ButtonModule, InputTextModule, MessageModule, PasswordModule],
  template: `
    <div class="container-x flex justify-center py-16">
      <div class="card w-full max-w-md p-8">
        <div class="mb-6 text-center">
          <span class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-xl text-amber-700"><fa-icon [icon]="i.userPlus" /></span>
          <h1 class="mt-4 text-3xl font-bold">Create account</h1>
          <p class="text-sm text-stone-500">Track orders and save your favourites</p>
        </div>

        @if (error()) { <p-message severity="error" styleClass="mb-4">{{ error() }}</p-message> }

        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">
          <div>
            <label class="field-label" for="name">Full name</label>
            <input pInputText id="name" formControlName="name" class="w-full" [invalid]="bad('name')" />
            @if (bad('name')) { <p class="field-error">Please enter your name</p> }
          </div>
          <div>
            <label class="field-label" for="email">Email</label>
            <input pInputText id="email" type="email" formControlName="email" class="w-full" [invalid]="bad('email')" />
            @if (bad('email')) { <p class="field-error">Please enter a valid email</p> }
          </div>
          <div>
            <label class="field-label" for="phone">Phone (optional)</label>
            <input pInputText id="phone" formControlName="phone" class="w-full" />
          </div>
          <div>
            <label class="field-label" for="password">Password</label>
            <p-password inputId="password" formControlName="password" [toggleMask]="true" [fluid]="true" />
            @if (bad('password')) { <p class="field-error">At least 6 characters</p> }
          </div>
          <div>
            <label class="field-label" for="confirm">Confirm password</label>
            <p-password inputId="confirm" formControlName="confirm" [feedback]="false" [toggleMask]="true" [fluid]="true" />
            @if (form.hasError('mismatch') && form.controls.confirm.touched) { <p class="field-error">Passwords don’t match</p> }
          </div>
          <p-button type="submit" styleClass="w-full">Create account</p-button>
        </form>

        <p class="mt-6 text-center text-sm text-stone-500">
          Already have an account? <a routerLink="/login" [queryParams]="{ returnUrl: returnUrl() }" class="font-semibold text-amber-700 hover:underline">Sign in</a>
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
  protected readonly error = signal('');

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
      this.error.set(res.error!);
      return;
    }
    this.toast.add({ severity: 'success', summary: 'Account created', detail: 'Welcome to Essence!', life: 2500 });
    this.router.navigateByUrl(this.returnUrl() || '/');
  }
}
