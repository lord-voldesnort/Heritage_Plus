import { ObservationRecord } from '../types';

export interface PersistenceAdapter {
  loadCases(): ObservationRecord[] | null;
  saveCases(cases: ObservationRecord[]): boolean;
  clear(): void;
}

export class ClientStorageAdapter implements PersistenceAdapter {
  private storageKey: string;
  private memoryFallback: Map<string, string>;

  constructor(storageKey: string = 'hp_change_ledger_cases_v1') {
    this.storageKey = storageKey;
    this.memoryFallback = new Map();
  }

  public loadCases(): ObservationRecord[] | null {
    try {
      let raw: string | null = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        raw = window.localStorage.getItem(this.storageKey);
      } else {
        raw = this.memoryFallback.get(this.storageKey) || null;
      }

      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed as ObservationRecord[];
      }
      return null;
    } catch (err) {
      console.warn('Failed to load cases from client storage:', err);
      return null;
    }
  }

  public saveCases(cases: ObservationRecord[]): boolean {
    try {
      const serialized = JSON.stringify(cases);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.storageKey, serialized);
      } else {
        this.memoryFallback.set(this.storageKey, serialized);
      }
      return true;
    } catch (err) {
      console.error('Failed to save cases to client storage:', err);
      return false;
    }
  }

  public clear(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(this.storageKey);
      }
      this.memoryFallback.delete(this.storageKey);
    } catch (err) {
      console.warn('Failed to clear client storage:', err);
    }
  }
}
