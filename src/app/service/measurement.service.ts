import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Measurement } from '../models/measurement';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MeasurementService {
  private readonly apiUrl = `${environment.baseUrl}/Measurement`;
  constructor(private http: HttpClient) { }

  getAllMeasurements(): Observable<Measurement[]> {
    return this.http.get<{ data: Measurement[] }>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }
  getMeasurementById(measurementId: number): Observable<Measurement> {
    const url = `${this.apiUrl}/${measurementId}`;
    return this.http.get<Measurement>(url);
  }
}

