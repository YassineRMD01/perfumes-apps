import { Injectable, signal } from '@angular/core';

const DB_NAME = 'essence-images';
const STORE = 'images';
const IDB_PREFIX = 'idb:';
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_DIMENSION = 1200;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(db: IDBDatabase, mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | void> {
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = run(t.objectStore(STORE));
    t.oncomplete = () => resolve(req ? req.result : undefined);
    t.onerror = () => reject(t.error);
  });
}

/** Downscale an image file to at most MAX_DIMENSION px and encode it as WebP (JPEG fallback). */
async function compress(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const webp = canvas.toDataURL('image/webp', 0.85);
  return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.85);
}

const newId = () =>
  IDB_PREFIX + (crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);

/**
 * Stores uploaded perfume photos in IndexedDB (localStorage is far too small for images)
 * and exposes them as an in-memory signal so templates can resolve references synchronously.
 */
@Injectable({ providedIn: 'root' })
export class ImageStore {
  private readonly _images = signal<Record<string, string>>({});
  private readonly db = openDb();

  constructor() {
    this.db
      .then((db) => {
        const t = db.transaction(STORE, 'readonly');
        const store = t.objectStore(STORE);
        const keysReq = store.getAllKeys();
        const valsReq = store.getAll();
        t.oncomplete = () => {
          const map: Record<string, string> = {};
          (keysReq.result as string[]).forEach((k, i) => (map[k] = valsReq.result[i] as string));
          this._images.update((m) => ({ ...map, ...m }));
        };
      })
      .catch(() => {
        /* IndexedDB unavailable: uploads stay in memory for this session */
      });
  }

  /** Turn a stored reference into something usable in <img src>. */
  resolve(ref: string | null | undefined): string | null {
    if (!ref) return null;
    return ref.startsWith(IDB_PREFIX) ? (this._images()[ref] ?? null) : ref;
  }

  isUpload(ref: string): boolean {
    return ref.startsWith(IDB_PREFIX);
  }

  /** Compress and persist an uploaded file. Returns its reference. */
  async add(file: File): Promise<string> {
    const dataUrl = await compress(file);
    const id = newId();
    this._images.update((m) => ({ ...m, [id]: dataUrl }));
    try {
      await tx(await this.db, 'readwrite', (s) => s.put(dataUrl, id));
    } catch {
      /* keep in memory only */
    }
    return id;
  }

  /** Delete uploaded photos (external URLs are ignored). */
  async remove(refs: string[]): Promise<void> {
    const ids = refs.filter((r) => this.isUpload(r));
    if (!ids.length) return;
    this._images.update((m) => {
      const next = { ...m };
      ids.forEach((id) => delete next[id]);
      return next;
    });
    try {
      const db = await this.db;
      await tx(db, 'readwrite', (s) => void ids.forEach((id) => s.delete(id)));
    } catch {
      /* ignore */
    }
  }
}
