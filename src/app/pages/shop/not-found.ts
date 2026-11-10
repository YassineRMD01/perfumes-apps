import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { I18N_PIPES } from '../../core/i18n/pipes';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, ButtonModule, ...I18N_PIPES],
  template: `
    <div class="container-x py-28 text-center">
      <p class="font-display text-8xl font-bold text-amber-600">404</p>
      <h1 class="mt-4 text-3xl font-bold">{{ 'nf.title' | t }}</h1>
      <p class="mt-2 text-stone-500">{{ 'nf.text' | t }}</p>
      <p-button class="mt-8 inline-block" routerLink="/">{{ 'nf.back' | t }}</p-button>
    </div>
  `,
})
export class NotFound {}
