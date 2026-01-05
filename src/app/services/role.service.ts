import { Injectable } from '@angular/core';

const STORAGE_KEY = 'choir:clientId';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private _clientId: string;

  constructor() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      this._clientId = existing;
    } else {
      this._clientId = this.generateId();
      try {
        localStorage.setItem(STORAGE_KEY, this._clientId);
      } catch (e) {
        // In private browsing localStorage may throw; ignore
      }
    }
  }

  get clientId() {
    return this._clientId;
  }

  private generateId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
