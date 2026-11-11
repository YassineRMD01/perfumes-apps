import { effect, Signal } from '@angular/core';

// Bumped with the Lumora rebrand: older "essence.*" demo data is simply ignored
export const PREFIX = 'lumora.';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Persist a signal to localStorage whenever it changes. Call inside an injection context. */
export function persist<T>(key: string, source: Signal<T>): void {
  effect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(source()));
    } catch {
      /* storage unavailable — keep in memory only */
    }
  });
}

export function resetDemoData(): void {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX) && k !== PREFIX + 'lang')
    .forEach((k) => localStorage.removeItem(k));
  try {
    indexedDB.deleteDatabase('lumora-images');
  } catch {
    /* ignore */
  }
}

/**
 * Returns true the first time it is called for `id` in this browser (then records it).
 * Used to add new demo content to data that was saved by an earlier version of the app.
 */
export function migrateOnce(id: string): boolean {
  const done = load<string[]>('migrations', []);
  if (done.includes(id)) return false;
  try {
    localStorage.setItem(PREFIX + 'migrations', JSON.stringify([...done, id]));
  } catch {
    /* ignore */
  }
  return true;
}
