import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProductType } from '../models/product-type';

@Injectable({
  providedIn: 'root',
})
export class ProductTypeService {

  private readonly apiUrl = `${environment.baseUrl}/ProductType`;
  constructor(private http: HttpClient) {}

  getAllProductTypes(): Observable<ProductType[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        const rows = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        return rows.map((item: any) => ({
          id: Number(item?.id ?? item?.Id ?? 0),
          name_ProductType: String(
            item?.name_ProductType ??
            item?.Name_ProductType ??
            item?.name_product_type ??
            item?.description_ProductType ??
            item?.Description_ProductType ??
            ''
          ),
        })).filter((t: ProductType) => t.id > 0 && t.name_ProductType.length > 0);
      })
    );
  }

}
