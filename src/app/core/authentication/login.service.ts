import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '@env/environment';
import { Menu } from '@core';
import { Token, User } from './interface';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  protected readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;
  login(username: string, password: string, rememberMe = false) {
    return this.http
      .post<any>(`${this.baseUrl}/auth/login`, {
        login: username, // 👈 importante: tu backend espera "login"
        password,
      })
      .pipe(
        map(res => ({
          access_token: res.access_token,
          token_type: res.token_type,
          expires_in: 3600, // puedes ajustar si luego implementas expiración real
          refresh_token: null,
        }))
      );
  }

  refresh(params: Record<string, any>) {
    return this.http.post<Token>('/auth/refresh', params);
  }

  logout() {
    return this.http.post<any>('/auth/logout', {});
  }

  user() {
    return this.http.get<User>('/user');
  }

  menu() {
    return this.http.get<{ menu: Menu[] }>('/user/menu').pipe(map(res => res.menu));
  }
}
