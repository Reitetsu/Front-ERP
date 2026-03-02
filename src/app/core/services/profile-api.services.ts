import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment'; // ajusta el alias según tu proyecto

type ApiMeResponse = { user: ApiUser } | ApiUser;

interface ApiUser {
  id: number;
  userName: string;
  email: string;
  role?: string;

  cwUser?: {
    person?: {
      gender_id?: number | null;
      phone_number_person?: string | null;
      address_person?: string | null;
      date_birth_person?: string | null; // "YYYY-MM-DD"
    } | null;
    company?: { name_company?: string | null } | null;
  } | null;
}

export interface ProfileFormVM {
  username: string;
  email: string;
  gender: '1' | '2' | '';  // mat-select usa string
  city: string;
  address: string;
  company: string;
  mobile: string;
  tele: string;
  website: string;
  date: Date | null;       // mejor para matDatepicker
}

@Injectable({ providedIn: 'root' })
export class ProfileApiService {
  private readonly baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  me(): Observable<ProfileFormVM> {
    return this.http.get<ApiMeResponse>(`${this.baseUrl}/auth/me`).pipe(
      map(res => {
        const u: ApiUser = (res as any)?.user ?? (res as any);

        const person = u?.cwUser?.person ?? null;
        const company = u?.cwUser?.company ?? null;

        // datepicker: usar Date | null
        const birth = person?.date_birth_person ? new Date(person.date_birth_person) : null;

        // gender: tu back trae gender_id (1/2). Si no viene, dejamos ''
        const gender = person?.gender_id === 1 ? '1' : person?.gender_id === 2 ? '2' : '';

        return {
          username: u?.userName ?? '',
          email: u?.email ?? '',
          gender,
          city: '', // no viene del API (si lo agregas después, lo mapeamos aquí)
          address: person?.address_person ?? '',
          company: company?.name_company ?? '',
          mobile: person?.phone_number_person ?? '',
          tele: '',    // no viene del API
          website: '', // no viene del API
          date: birth,
        } satisfies ProfileFormVM;
      })
    );
  }
}
