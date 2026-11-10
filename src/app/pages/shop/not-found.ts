import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, ButtonModule],
  template: `
    <div class="container-x py-28 text-center">
      <p class="font-display text-8xl font-bold text-amber-600">404</p>
      <h1 class="mt-4 text-3xl font-bold">This scent has evaporated</h1>
      <p class="mt-2 text-stone-500">The page you are looking for doesn’t exist.</p>
      <p-button class="mt-8 inline-block" routerLink="/">Back home</p-button>
    </div>
  `,
})
export class NotFound {}
