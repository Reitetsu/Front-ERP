import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CreateSimplePersonDto, PersonSale, PersonSearchResult } from '../models/person-sale';

interface ApiContract<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[];
}

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  private readonly apiUrl = `${environment.baseUrl}/Person`;

  constructor(private readonly http: HttpClient) {}

  searchPerson(searchQuery: string): Observable<PersonSearchResult | null> {
    const params = new HttpParams().set('searchQuery', searchQuery);
    return this.http
      .get<PersonSearchResult | ApiContract<PersonSearchResult>>(`${this.apiUrl}/search`, { params })
      .pipe(
        map(response => {
          if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            const wrapped = response as ApiContract<PersonSearchResult>;
            if (!wrapped.success || !wrapped.data) {
              return null;
            }
            const data = wrapped.data as any;
            const hasAnyField = Object.keys(data ?? {}).length > 0;
            const hasValidId = Number(data?.id ?? data?.Id ?? 0) > 0;
            return hasAnyField && hasValidId ? (wrapped.data as PersonSearchResult) : null;
          }
          const plain = response as any;
          const hasAnyField = Object.keys(plain ?? {}).length > 0;
          const hasValidId = Number(plain?.id ?? plain?.Id ?? 0) > 0;
          return hasAnyField && hasValidId ? (plain as PersonSearchResult) : null;
        })
      );
  }

  createSimplePerson(payload: CreateSimplePersonDto): Observable<PersonSale> {
    return this.http
      .post<PersonSale | ApiContract<PersonSale>>(`${this.apiUrl}/create-simple`, payload)
      .pipe(
        map(response => {
          if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            const wrapped = response as ApiContract<PersonSale>;
            return (wrapped.data as PersonSale) ?? ({} as PersonSale);
          }
          return response as PersonSale;
        })
      );
  }
}
