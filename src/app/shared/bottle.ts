import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

let uid = 0;

/** Renders a product image, or a generated SVG perfume bottle tinted with the product color. */
@Component({
  selector: 'app-bottle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (imageUrl()) {
      <img [src]="imageUrl()" [alt]="name()" class="h-full w-full object-contain" loading="lazy" />
    } @else {
      <svg viewBox="0 0 120 160" class="h-full w-full drop-shadow-xl" role="img" [attr.aria-label]="name()">
        <defs>
          <linearGradient [attr.id]="gid" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" [attr.stop-color]="color()" stop-opacity="1" />
            <stop offset="100%" [attr.stop-color]="color()" stop-opacity="0.55" />
          </linearGradient>
          <linearGradient [attr.id]="gid + 'c'" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#292524" />
            <stop offset="50%" stop-color="#57534e" />
            <stop offset="100%" stop-color="#1c1917" />
          </linearGradient>
        </defs>
        <rect x="42" y="4" width="36" height="28" rx="5" [attr.fill]="'url(#' + gid + 'c)'" />
        <rect x="50" y="32" width="20" height="12" fill="#d6d3d1" />
        <rect x="16" y="44" width="88" height="110" rx="18" [attr.fill]="'url(#' + gid + ')'"
              stroke="rgba(255,255,255,.7)" stroke-width="2" />
        <rect x="24" y="54" width="9" height="88" rx="4.5" fill="#fff" opacity=".3" />
        <rect x="32" y="86" width="56" height="34" rx="3" fill="#fff" opacity=".9" />
        <text x="60" y="101" text-anchor="middle" font-size="8.5" font-family="Playfair Display, serif" fill="#1c1917">{{ label() }}</text>
        <text x="60" y="112" text-anchor="middle" font-size="5" letter-spacing="1" font-family="Inter, sans-serif" fill="#78716c">{{ sub() }}</text>
      </svg>
    }
  `,
})
export class Bottle {
  readonly color = input('#d6b38a');
  readonly name = input('');
  readonly brand = input('');
  readonly imageUrl = input<string | null | undefined>(null);

  protected readonly gid = `bottle-${++uid}`;
  protected readonly label = computed(() => {
    const n = this.name();
    return n.length > 14 ? n.slice(0, 13) + '…' : n;
  });
  protected readonly sub = computed(() => this.brand().toUpperCase().slice(0, 18));
}
