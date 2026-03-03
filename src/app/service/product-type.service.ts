import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductTypeService {

  private readonly apiUrl = `${environment.baseUrl}/ProductType`;
  constructor(private http: HttpClient) {}

  getAllProductTypes(): Observable<ProductType[]> {
    return this.http.get<{data:ProductType[]}>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

}

interface ProductType {
  id: number;
  name_ProductType : string;
}
