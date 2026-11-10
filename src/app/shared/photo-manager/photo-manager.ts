import { ChangeDetectionStrategy, Component, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { I18nService } from '../../core/i18n/i18n.service';
import { I18N_PIPES } from '../../core/i18n/pipes';
import { ImageStore, MAX_UPLOAD_BYTES } from '../../core/image-store.service';
import { MAX_PHOTOS } from '../../core/models';
import { Icons } from '../icons';

/**
 * Manage a perfume's photo list (max 5): upload by click or drag & drop, add by URL,
 * reorder, pick the cover (first photo) and remove.
 */
@Component({
  selector: 'app-photo-manager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, FaIconComponent, ButtonModule, InputTextModule, TooltipModule, ...I18N_PIPES],
  templateUrl: './photo-manager.html',
  styleUrl: './photo-manager.css',
})
export class PhotoManager {
  readonly images = model<string[]>([]);
  readonly max = input(MAX_PHOTOS);
  /** Optional label / hint overrides (e.g. when used for a single logo). */
  readonly label = input<string | null>(null);
  readonly hint = input<string | null>(null);
  /** Emits every newly uploaded reference so the parent can clean up on cancel. */
  readonly uploaded = output<string>();

  protected readonly store = inject(ImageStore);
  private readonly toast = inject(MessageService);
  private readonly i18n = inject(I18nService);
  protected readonly i = Icons;
  protected readonly busy = signal(false);
  protected readonly dragOver = signal(false);
  protected url = '';

  protected onPick(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.addFiles(Array.from(input.files ?? []));
    input.value = '';
  }

  protected onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragOver.set(false);
    this.addFiles(Array.from(e.dataTransfer?.files ?? []));
  }

  private warn(summary: string): void {
    this.toast.add({ severity: 'warn', summary, life: 3500 });
  }

  async addFiles(files: File[]): Promise<void> {
    const room = this.max() - this.images().length;
    if (room <= 0 || files.length > room) this.warn(this.i18n.t('toast.maxPhotos', { max: this.max() }));
    const batch = files.slice(0, Math.max(0, room));
    if (!batch.length) return;

    this.busy.set(true);
    for (const file of batch) {
      if (!file.type.startsWith('image/')) {
        this.warn(this.i18n.t('toast.badFile', { name: file.name }));
        continue;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        this.warn(this.i18n.t('toast.fileTooBig', { name: file.name }));
        continue;
      }
      try {
        const ref = await this.store.add(file);
        this.images.update((list) => [...list, ref]);
        this.uploaded.emit(ref);
      } catch {
        this.warn(this.i18n.t('toast.uploadFailed', { name: file.name }));
      }
    }
    this.busy.set(false);
  }

  addUrl(): void {
    const value = this.url.trim();
    if (!value) return;
    if (this.images().length >= this.max()) return this.warn(this.i18n.t('toast.maxPhotos', { max: this.max() }));
    try {
      const u = new URL(value);
      if (!/^https?:$/.test(u.protocol)) throw new Error();
    } catch {
      return this.warn(this.i18n.t('toast.badUrl'));
    }
    this.images.update((list) => (list.includes(value) ? list : [...list, value]));
    this.url = '';
  }

  move(index: number, delta: number): void {
    this.images.update((list) => {
      const next = [...list];
      const target = index + delta;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  makeCover(index: number): void {
    this.images.update((list) => [list[index], ...list.filter((_, i) => i !== index)]);
  }

  remove(index: number): void {
    this.images.update((list) => list.filter((_, i) => i !== index));
  }
}
