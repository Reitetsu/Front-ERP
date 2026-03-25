import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaymentType } from '../models/payment-type';

@Injectable({
  providedIn: 'root',
})
export class PaymentTypeService {
  private readonly apiUrl = `${environment.baseUrl}/PaymentType`;

  constructor(private readonly http: HttpClient) {}

  getPaymentTypes(): Observable<PaymentType[]> {
    return this.http.get<PaymentType[]>(this.apiUrl);
  }
}
