export interface DetailSale {
  id: number;
  saleId: number;
  menuId: number;
  amount_DetailSale: number;
  unitPrice_DetailSale: number;
  subtotal_DetailSale: number;
}

export interface DetailSaleCreateDto {
  saleId: number;
  menuId: number;
  amount_DetailSale: number;
  unitPrice_DetailSale: number;
  subtotal_DetailSale: number;
}
