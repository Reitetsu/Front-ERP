export interface Sale {
  id: number;
  customerId: number;
  date_Sale: string | Date;
  total_Sale: number;
  status_Sale: string;
  type_Sale: string;
}

export interface SaleCreateDto {
  customerId: number;
  date_Sale: string;
  total_Sale: number;
  status_Sale: string;
  type_Sale: string;
}

export interface SaleUpdateDto extends SaleCreateDto {
  id: number;
}

export interface SaleFilterDto {
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface SaleSearchDto {
  code_Sale?: number;
  startDate?: string;
  endDate?: string;
  total_Sale?: number;
  status_Sale?: string;
  type_Sale?: string;
}
