import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Menu, MenuCreateDto, MenuUpdateDto } from '../models/menu';

@Injectable({
  providedIn: 'root',
})
export class MenuCrudService {
  private readonly apiUrl = `${environment.baseUrl}/Menu`;

  constructor(private readonly http: HttpClient) {}

  getAllMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(this.apiUrl);
  }

  getMenuById(menuId: number): Observable<Menu> {
    return this.http.get<Menu>(`${this.apiUrl}/${menuId}`);
  }

  addMenu(menu: MenuCreateDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, menu);
  }

  updateMenu(menuId: number, menu: MenuUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${menuId}`, menu as MenuCreateDto);
  }

  deleteMenu(menuId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${menuId}`);
  }
}
