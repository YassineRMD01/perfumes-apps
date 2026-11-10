import { effect, Signal } from '@angular/core';

const PREFIX = 'essence.';

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
    indexedDB.deleteDatabase('essence-images');
  } catch {
    /* ignore */
  }
}
