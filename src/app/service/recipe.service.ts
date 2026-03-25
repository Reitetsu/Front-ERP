import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RecipeDetailDto, RecipeDto } from '../models/recipe';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  private readonly apiUrl = `${environment.baseUrl}/Recipe`;

  constructor(private readonly http: HttpClient) {}

  addRecipe(recipe: RecipeDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, recipe);
  }

  getRecipeDetails(menuId: number): Observable<RecipeDetailDto[]> {
    return this.http.get<RecipeDetailDto[]>(`${this.apiUrl}/${menuId}/RecipeDetails`);
  }

  updateRecipe(recipeId: number, recipe: RecipeDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${recipeId}`, recipe);
  }

  deleteRecipe(recipeId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${recipeId}`);
  }
}
