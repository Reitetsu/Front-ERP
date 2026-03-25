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
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        const rows = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        return rows.map((item: any) => ({
          id: Number(item?.id ?? item?.Id ?? 0),
          abbreviation_Measurement: String(
            item?.abbreviation_Measurement ??
            item?.Abbreviation_Measurement ??
            item?.abbreviation_measurement ??
            ''
          ),
        })).filter((m: Measurement) => m.id > 0);
      })
    );
  }
  getMeasurementById(measurementId: number): Observable<Measurement> {
    const url = `${this.apiUrl}/${measurementId}`;
    return this.http.get<Measurement>(url);
  }
}

