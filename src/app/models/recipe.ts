export interface RecipeDto {
  id: number;
  menuId: number;
  productId: number;
  Amount_Recipe: number;
}

export interface RecipeDetailDto {
  id: number;
  menuId: number;
  productId: number;
  Amount_Recipe: number;
  productName: string;
  productMeasurement: string;
}

export interface RecipeDraftItem {
  id?: number;
  productId: number;
  Amount_Recipe: number;
  productName?: string;
  productMeasurement?: string;
}

export interface MenuCreatePayload {
  menu: {
    code_Menu: number;
    name_Menu: string;
    description_Menu: string;
    price_Menu: number;
  };
  recipes: RecipeDraftItem[];
}

export interface MenuUpdatePayload {
  menu: Partial<{
    code_Menu: number;
    name_Menu: string;
    description_Menu: string;
    price_Menu: number;
  }>;
  recipes: RecipeDraftItem[];
}
