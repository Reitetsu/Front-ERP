import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Product } from '../models/product';
import { environment } from 'src/environments/environment';



@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.baseUrl}/Product`;
  constructor(private http: HttpClient) {}
  getProductspag(searchDto: any, page: number, size: number): Observable<any> {
    debugger
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (searchDto) {
      Object.keys(searchDto).forEach(key => {
        if (searchDto[key]) {
          params = params.set(key, searchDto[key]);
        }
      });
    }

    return this.http.get<any>(`${this.apiUrl}/searchproduct`, { params });
  }
  getProducts(params: any): Observable<any> {
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
  addProduct(product: Product): Observable<any> {
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
  updateProduct(productId: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${productId}`, product);
  }

  deleteProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}`);
  }
}

