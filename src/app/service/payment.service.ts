import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Payment, PaymentWithDetails } from '../models/payment';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly apiUrl = `${environment.baseUrl}/Payment`;

  constructor(private readonly http: HttpClient) {}

  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl);
  }

  getAllPaymentSales(): Observable<PaymentWithDetails[]> {
    return this.http.get<PaymentWithDetails[]>(`${this.apiUrl}/with-payment`);
  }

  getPaymentsBySaleId(saleId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/by-saleId/${saleId}`);
  }

  addPayment(payment: Payment): Observable<number> {
    return this.http.post<number>(this.apiUrl, payment);
  }

  updatePayment(paymentId: number, payment: Payment): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${paymentId}`, payment);
  }

  getTotalPaymentsDate(dateIso: string, timeZoneOffset: number): Observable<number> {
    const params = new HttpParams().set('date', dateIso).set('timeZoneOffset', String(timeZoneOffset));
    return this.http.get<number>(`${this.apiUrl}/total-payments`, { params });
  }
}
