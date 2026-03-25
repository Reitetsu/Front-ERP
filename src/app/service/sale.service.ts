import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Sale, SaleCreateDto, SaleFilterDto, SaleUpdateDto } from '../models/sale';

@Injectable({
  providedIn: 'root',
})
export class SaleService {
  private readonly apiUrl = `${environment.baseUrl}/Sale`;

  constructor(private readonly http: HttpClient) {}

  getAllSales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.apiUrl);
  }

  getSaleById(saleId: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.apiUrl}/${saleId}`);
  }

  filterSales(filters: SaleFilterDto): Observable<Sale[]> {
    let params = new HttpParams();

    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get<Sale[]>(`${this.apiUrl}/filter`, { params });
  }

  addSale(sale: SaleCreateDto): Observable<Sale> {
    return this.http.post<Sale>(this.apiUrl, sale);
  }

  updateSale(saleId: number, sale: SaleUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${saleId}`, sale);
  }

  updateSaleStatus(saleId: number, status: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${saleId}/status`,
      JSON.stringify(status),
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  deleteSale(saleId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${saleId}`);
  }
}
