import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SaleMenu } from '../models/sale-menu';

@Injectable({
  providedIn: 'root',
})
export class SaleMenuService {
  private readonly apiUrl = `${environment.baseUrl}/Menu`;

  constructor(private readonly http: HttpClient) {}

  getAllMenus(): Observable<SaleMenu[]> {
    return this.http.get<SaleMenu[]>(this.apiUrl);
  }
}
