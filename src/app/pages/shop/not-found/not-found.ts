import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { I18N_PIPES } from '../../../core/i18n/pipes';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, ButtonModule, ...I18N_PIPES],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {}
