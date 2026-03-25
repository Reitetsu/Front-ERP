import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DetailSale, DetailSaleCreateDto } from '../models/detail-sale';

@Injectable({
  providedIn: 'root',
})
export class DetailSaleService {
  private readonly apiUrl = `${environment.baseUrl}/DetailSale`;

  constructor(private readonly http: HttpClient) {}

  getAllDetailSales(): Observable<DetailSale[]> {
    return this.http.get<DetailSale[]>(this.apiUrl);
  }

  getDetailSaleById(detailSaleId: number): Observable<DetailSale> {
    return this.http.get<DetailSale>(`${this.apiUrl}/${detailSaleId}`);
  }

  getDetailSaleBySaleId(saleId: number): Observable<DetailSale[]> {
    return this.http.get<DetailSale[]>(`${this.apiUrl}/sale/${saleId}`);
  }

  addDetailSale(detailSale: DetailSaleCreateDto): Observable<number> {
    return this.http.post<number>(this.apiUrl, detailSale);
  }

  updateDetailSale(detailSaleId: number, detailSale: DetailSaleCreateDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${detailSaleId}`, detailSale);
  }

  deleteDetailSale(detailSaleId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${detailSaleId}`);
  }
}
