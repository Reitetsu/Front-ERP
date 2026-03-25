export interface Menu {
  id: number;
  code_Menu: number;
  name_Menu: string;
  description_Menu: string;
  price_Menu: number;
}

export interface MenuSearchDto {
  code_Menu?: number;
  name_Menu?: string;
  description_Menu?: string;
  price_Menu?: number;
}

export type MenuCreateDto = Omit<Menu, 'id'>;

export type MenuUpdateDto = Partial<MenuCreateDto>;
