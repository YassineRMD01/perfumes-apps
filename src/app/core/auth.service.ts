import { computed, Injectable, signal } from '@angular/core';
import { ShippingInfo, User } from './models';
import { SEED_USERS } from './seed';
import { load, persist } from './storage';

export type PublicUser = Omit<User, 'password'>;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _users = signal<User[]>(load('users', SEED_USERS));
  private readonly _currentId = signal<number | null>(load('session', null));

  readonly users = computed<PublicUser[]>(() => this._users().map(({ password: _, ...u }) => u));
  readonly customers = computed(() => this.users().filter((u) => u.role === 'client'));
  readonly currentUser = computed<PublicUser | null>(
    () => this.users().find((u) => u.id === this._currentId()) ?? null,
  );
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor() {
    persist('users', this._users);
    persist('session', this._currentId);
  }

  login(email: string, password: string): boolean {
    const user = this._users().find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
    );
    if (!user) return false;
    this._currentId.set(user.id);
    return true;
  }

  register(data: { name: string; email: string; password: string; phone?: string }): { ok: boolean; error?: string } {
    if (this._users().some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    const id = Math.max(0, ...this._users().map((u) => u.id)) + 1;
    const user: User = { ...data, email: data.email.trim(), id, role: 'client', createdAt: new Date().toISOString() };
    this._users.update((list) => [...list, user]);
    this._currentId.set(id);
    return { ok: true };
  }

  updateProfile(changes: { name: string; phone?: string }): void {
    const id = this._currentId();
    this._users.update((list) => list.map((u) => (u.id === id ? { ...u, name: changes.name.trim(), phone: changes.phone?.trim() } : u)));
  }

  saveAddress(address: ShippingInfo): void {
    const id = this._currentId();
    this._users.update((list) => list.map((u) => (u.id === id ? { ...u, address } : u)));
  }

  /** Returns false when the current password is wrong. */
  changePassword(current: string, next: string): boolean {
    const user = this._users().find((u) => u.id === this._currentId());
    if (!user || user.password !== current) return false;
    this._users.update((list) => list.map((u) => (u.id === user.id ? { ...u, password: next } : u)));
    return true;
  }

  logout(): void {
    this._currentId.set(null);
  }
}
