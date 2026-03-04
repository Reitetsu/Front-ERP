import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  async obtenerCompany(): Promise<number | null> {
    const raw = localStorage.getItem('company_id');
    if (!raw) return 1;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 1;
  }
}
