import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Product, ProductCreateDto, ProductSearchDto, ProductUpdateDto } from '../models/product';
import { environment } from 'src/environments/environment';



@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.baseUrl}/Product`;
  constructor(private http: HttpClient) {}
  getProductspag(searchDto: ProductSearchDto, page: number, size: number): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (searchDto) {
      const query = searchDto as Record<string, any>;
      Object.keys(query).forEach(key => {
        if (query[key] !== undefined && query[key] !== null && `${query[key]}`.trim() !== '') {
          params = params.set(key, query[key]);
        }
      });
    }

    return this.http.get<any>(`${this.apiUrl}/searchproduct`, { params });
  }
  getProducts(searchDto: ProductSearchDto): Observable<any> {
    let params = new HttpParams();
    Object.keys(searchDto ?? {}).forEach(key => {
      const value = (searchDto as any)[key];
      if (value !== undefined && value !== null && `${value}`.trim() !== '') {
        params = params.set(key, value);
      }
    });

    return this.http.get<any>(`${this.apiUrl}/searchproducts`, { params });
  }
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
  getProductById(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${productId}`);
  }
  getProductByCode(code: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/code/${code}`);
  }
  addProduct(product: ProductCreateDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, product).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores de red u otros
        return throwError(() => new Error('Ocurrió un error inesperado.'));
      })
    );
  }
  uploadProducts(products: Product[]): Observable<any> {
    return this.http.post<any>(this.apiUrl, products);
  }
  updateProduct(productId: number, product: ProductUpdateDto): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${productId}`, product);
  }

  deleteProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}`);
  }
}

