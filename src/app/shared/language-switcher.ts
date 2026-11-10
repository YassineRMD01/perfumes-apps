import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { I18nService, LANGUAGES } from '../core/i18n/i18n.service';
import { Icons } from './icons';

@Component({
  selector: 'app-language-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FaIconComponent, MenuModule],
  template: `
    <button type="button" (click)="menu.toggle($event)"
            class="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-stone-700 hover:bg-stone-100"
            [attr.aria-label]="i18n.t('common.language')" aria-haspopup="true">
      <fa-icon [icon]="i.globe" class="text-base" />
      <span>{{ i18n.option().short }}</span>
    </button>
    <p-menu #menu [model]="items()" [popup]="true" appendTo="body">
      <ng-template #item let-item>
        <a class="p-menu-item-link flex items-center justify-between gap-8" [attr.lang]="item.state.code">
          <span [class.font-semibold]="item.state.active">{{ item.label }}</span>
          @if (item.state.active) { <fa-icon [icon]="i.check" class="text-amber-600" /> }
        </a>
      </ng-template>
    </p-menu>
  `,
})
export class LanguageSwitcher {
  protected readonly i18n = inject(I18nService);
  protected readonly i = Icons;

  protected readonly items = computed<MenuItem[]>(() =>
    LANGUAGES.map((l) => ({
      label: l.label,
      state: { code: l.code, active: l.code === this.i18n.lang() },
      command: () => this.i18n.use(l.code),
    })),
  );
}
