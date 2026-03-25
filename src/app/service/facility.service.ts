import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Facility, FacilityCreateDto, FacilityUpdateDto } from '../models/facility';

@Injectable({
  providedIn: 'root',
})
export class FacilityService {
  private readonly apiUrl = `${environment.baseUrl}/Facility`;

  constructor(private readonly http: HttpClient) {}

  getAllFacilities(): Observable<Facility[]> {
    return this.http.get<Facility[]>(this.apiUrl);
  }

  getFacilitiesByCompanyId(companyId: number): Observable<Facility[]> {
    return this.http.get<Facility[]>(`${this.apiUrl}/company/${companyId}`);
  }

  getFacilityById(facilityId: number): Observable<Facility> {
    return this.http.get<Facility>(`${this.apiUrl}/${facilityId}`);
  }

  addFacility(facility: FacilityCreateDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, facility);
  }

  updateFacility(facilityId: number, facility: FacilityUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${facilityId}`, facility as FacilityCreateDto);
  }

  deleteFacility(facilityId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${facilityId}`);
  }
}
