import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { Menu } from '@core';
import { Token, User } from './interface';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  protected readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;
  private readonly defaultAvatar = 'images/avatar-default.jpg';
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

  user(): Observable<User> {
    return this.http.get<User>('/user').pipe(
      map(user => ({
        ...user,
        avatar: this.resolveAvatar(user?.avatar),
      }))
    );
  }

  menu() {
    return this.http.get<{ menu: Menu[] }>('/user/menu').pipe(map(res => res.menu));
  }

  private resolveAvatar(value: unknown): string {
    const avatar = value == null ? '' : String(value).trim();
    return avatar.length > 0 ? avatar : this.defaultAvatar;
  }
}
