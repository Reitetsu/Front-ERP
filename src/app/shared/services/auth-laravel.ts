import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface LaravelLoginResponse {
  access_token: string;
  token_type?: string;      // Bearer
  expires_in?: number;      // segundos (si tu backend lo manda)
  refresh_token?: string;   // si existe
  data_user?: any;
}

@Injectable({ providedIn: 'root' })
export class AuthLaravelService {
  private readonly loginUrl = `${environment.baseUrl}/login`;
  private readonly registerUrl = `${environment.baseUrl}/register`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LaravelLoginResponse> {
    return this.http.post<LaravelLoginResponse>(this.loginUrl, { email, password });
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(this.registerUrl, { name, email, password });
  }
}