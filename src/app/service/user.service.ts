import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserService {
  /**
   * Ajusta la key según tu auth real.
   * Por defecto intenta: 'user' y 'token' etc.
   */
  getUserDat(): any {
    const raw =
      localStorage.getItem('user') ||
      localStorage.getItem('userData') ||
      localStorage.getItem('currentUser');

    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
