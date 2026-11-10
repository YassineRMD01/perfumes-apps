import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../core/auth.service';
import { Icons } from '../../shared/icons';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, FaIconComponent, ButtonModule, InputTextModule, MessageModule, PasswordModule],
  template: `
    <div class="container-x flex justify-center py-16">
      <div class="card w-full max-w-md p-8">
        <div class="mb-6 text-center">
          <span class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-xl text-amber-700"><fa-icon [icon]="i.login" /></span>
          <h1 class="mt-4 text-3xl font-bold">Welcome back</h1>
          <p class="text-sm text-stone-500">Sign in to your Essence account</p>
        </div>

        @if (error()) { <p-message severity="error" styleClass="mb-4">{{ error() }}</p-message> }

        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">
          <div>
            <label class="field-label" for="email">Email</label>
            <input pInputText id="email" type="email" formControlName="email" class="w-full" autocomplete="email" />
          </div>
          <div>
            <label class="field-label" for="password">Password</label>
            <p-password inputId="password" formControlName="password" [feedback]="false" [toggleMask]="true" [fluid]="true" />
          </div>
          <p-button type="submit" styleClass="w-full" [disabled]="form.invalid">Sign in</p-button>
        </form>

        <div class="mt-6 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-sm">
          <div class="mb-2 font-semibold text-amber-800">Demo accounts</div>
          <div class="flex flex-col gap-2 sm:flex-row">
            <p-button size="small" severity="contrast" [outlined]="true" styleClass="w-full" (onClick)="fill('admin@essence.shop', 'admin123')">
              <fa-icon [icon]="i.shield" /> Admin
            </p-button>
            <p-button size="small" severity="contrast" [outlined]="true" styleClass="w-full" (onClick)="fill('client@essence.shop', 'client123')">
              <fa-icon [icon]="i.user" /> Client
            </p-button>
          </div>
        </div>

        <p class="mt-6 text-center text-sm text-stone-500">
          New to Essence? <a routerLink="/register" [queryParams]="{ returnUrl: returnUrl() }" class="font-semibold text-amber-700 hover:underline">Create an account</a>
        </p>
      </div>
    </div>
  `,
})
export class Login {
  readonly returnUrl = input<string>();
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(MessageService);
  protected readonly i = Icons;
  protected readonly error = signal('');

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
      this.error.set('Invalid email or password.');
      return;
    }
    const user = this.auth.currentUser()!;
    this.toast.add({ severity: 'success', summary: `Welcome, ${user.name.split(' ')[0]}!`, life: 2000 });
    this.router.navigateByUrl(this.returnUrl() || (user.role === 'admin' ? '/admin' : '/'));
  }
}
