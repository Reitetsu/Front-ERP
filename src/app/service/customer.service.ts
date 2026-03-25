import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Customer } from '../models/customer';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly apiUrl = `${environment.baseUrl}/Customer`;

  constructor(private readonly http: HttpClient) {}

  verifyCustomer(personId: number): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/verificar-cliente`, { id: personId });
  }

  createCustomer(personId: number): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/crear-cliente`, { id: personId });
  }
}
