import { Injectable } from '@angular/core';

const STORAGE_KEY = 'choir:clientId';
const LEADER_KEY = 'choir:leaderId';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private _clientId: string;
  private _leaderId: string | null = null;

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

    try {
      this._leaderId = localStorage.getItem(LEADER_KEY);
    } catch (e) {
      this._leaderId = null;
    }
  }

  get clientId() {
    return this._clientId;
  }

  get leaderId() {
    return this._leaderId;
  }

  setLeaderId(id: string | null) {
    this._leaderId = id;
    try {
      if (id) localStorage.setItem(LEADER_KEY, id);
      else localStorage.removeItem(LEADER_KEY);
    } catch (e) {
      // ignore storage failures
    }
  }

  isLeader(perfLeaderId: string | null) {
    return !!(perfLeaderId && this._leaderId && perfLeaderId === this._leaderId);
  }

  private generateId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
