import { ChangeDetectionStrategy, Component, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { I18nService } from '../core/i18n/i18n.service';
import { I18N_PIPES } from '../core/i18n/pipes';
import { ImageStore, MAX_UPLOAD_BYTES } from '../core/image-store.service';
import { MAX_PHOTOS } from '../core/models';
import { Icons } from './icons';

/**
 * Manage a perfume's photo list (max 5): upload by click or drag & drop, add by URL,
 * reorder, pick the cover (first photo) and remove.
 */
@Component({
  selector: 'app-photo-manager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, FaIconComponent, ButtonModule, InputTextModule, TooltipModule, ...I18N_PIPES],
  template: `
    <div class="mb-2 flex items-center justify-between">
      <span class="field-label !mb-0">{{ 'ap.photos' | t: { n: images().length, max: max() } }}</span>
      @if (busy()) {
        <span class="text-xs text-amber-700"><fa-icon [icon]="i.spinner" animation="spin" /> {{ 'ap.processing' | t }}</span>
      }
    </div>

    <div class="grid grid-cols-3 gap-2 sm:grid-cols-5">
      @for (ref of images(); track ref; let idx = $index; let first = $first; let last = $last) {
        <div class="group relative aspect-square overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
          @if (store.resolve(ref); as src) {
            <img [src]="src" alt="" class="h-full w-full object-cover" />
          } @else {
            <div class="grid h-full place-items-center text-stone-400"><fa-icon [icon]="i.image" /></div>
          }
          @if (first) {
            <span class="absolute start-1.5 top-1.5 rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-semibold text-white">{{ 'ap.cover' | t }}</span>
          }
          <div class="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 pt-6
                      opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <button type="button" class="tile-btn" [disabled]="first" (click)="move(idx, -1)" [pTooltip]="'ap.moveBack' | t" tooltipPosition="top"
                    [attr.aria-label]="'ap.moveBack' | t">
              <fa-icon [icon]="i.chevronLeft" class="rtl:-scale-x-100" />
            </button>
            @if (!first) {
              <button type="button" class="tile-btn" (click)="makeCover(idx)" [pTooltip]="'ap.makeCover' | t" tooltipPosition="top"
                      [attr.aria-label]="'ap.makeCover' | t">
                <fa-icon [icon]="i.star" />
              </button>
            }
            <button type="button" class="tile-btn" [disabled]="last" (click)="move(idx, 1)" [pTooltip]="'ap.moveForward' | t" tooltipPosition="top"
                    [attr.aria-label]="'ap.moveForward' | t">
              <fa-icon [icon]="i.chevronRight" class="rtl:-scale-x-100" />
            </button>
            <button type="button" class="tile-btn hover:!bg-red-600" (click)="remove(idx)" [pTooltip]="'ap.removePhoto' | t" tooltipPosition="top"
                    [attr.aria-label]="'ap.removePhoto' | t">
              <fa-icon [icon]="i.trash" />
            </button>
          </div>
        </div>
      }

      @if (images().length < max()) {
        <label class="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed p-2 text-center text-xs transition"
               [class.border-amber-500]="dragOver()" [class.bg-amber-50]="dragOver()" [class.border-stone-300]="!dragOver()"
               [class.text-stone-500]="!dragOver()" [class.text-amber-700]="dragOver()"
               (dragover)="$event.preventDefault(); dragOver.set(true)" (dragleave)="dragOver.set(false)" (drop)="onDrop($event)">
          <fa-icon [icon]="i.upload" class="text-xl" />
          <span class="font-medium">{{ 'ap.addPhoto' | t }}</span>
          <span class="hidden text-[10px] leading-tight sm:block">{{ 'ap.dropHere' | t }}</span>
          <input type="file" accept="image/*" multiple class="sr-only" (change)="onPick($event)" [disabled]="busy()" />
        </label>
      }
    </div>

    <div class="mt-2 flex gap-2">
      <input pInputText type="url" [(ngModel)]="url" [placeholder]="'ap.urlPlaceholder' | t" class="min-w-0 flex-1" dir="ltr"
             [disabled]="images().length >= max()" (keydown.enter)="$event.preventDefault(); addUrl()" />
      <p-button severity="secondary" [outlined]="true" (onClick)="addUrl()" [disabled]="!url.trim() || images().length >= max()">
        <fa-icon [icon]="i.link" /> {{ 'ap.addUrl' | t }}
      </p-button>
    </div>
    <p class="mt-1 text-xs text-stone-500">{{ 'ap.photoHint' | t }}</p>
  `,
  styles: `
    .tile-btn {
      display: grid;
      place-items: center;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 9999px;
      background: rgb(255 255 255 / 0.9);
      color: #292524;
      font-size: 0.75rem;
      transition: background 0.15s;
    }
    .tile-btn:hover:not(:disabled) { background: #f59e0b; color: white; }
    .tile-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  `,
})
export class PhotoManager {
  readonly images = model<string[]>([]);
  readonly max = input(MAX_PHOTOS);
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
