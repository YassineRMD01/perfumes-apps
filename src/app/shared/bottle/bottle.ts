import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ImageStore } from '../../core/image-store.service';

let uid = 0;

/**
 * Renders a perfume photo (uploaded or URL) or, when there is none,
 * a generated SVG bottle tinted with the product color.
 */
@Component({
  selector: 'app-bottle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bottle.html',
  styleUrl: './bottle.css',
})
export class Bottle {
  private readonly images = inject(ImageStore);

  readonly color = input('#d6b38a');
  readonly name = input('');
  readonly brand = input('');
  /** Photo reference (URL or "idb:" id). */
  readonly image = input<string | null | undefined>(null);
  readonly fit = input<'contain' | 'cover'>('contain');

  protected readonly src = computed(() => this.images.resolve(this.image()));
  protected readonly gid = `bottle-${++uid}`;
  protected readonly label = computed(() => {
    const n = this.name();
    return n.length > 14 ? n.slice(0, 13) + '…' : n;
  });
  protected readonly sub = computed(() => this.brand().toUpperCase().slice(0, 18));
}
