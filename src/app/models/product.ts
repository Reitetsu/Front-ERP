import { Measurement } from "./measurement";
import { ProductType } from "./product-type";

export interface Product {
    id: number;
    name_ProductType: string;
    productTypeId:number;
    abbreviation_Measurement: string;
    measurementId:number;
    code_Product: string;
    name_Product: string;
    description_Product:string;
    price_Product: number;
    stock_Product: number;
    barcode_Product:string;
  }
  export interface ProductDto {
    id: number;
    code_Product: string;
    name_Product: string;
    description_Product:string;
    price_Product: number;
    stock_Product: number;
    barcode_Product:string;
  }
  export interface ProductSearchDto {
    code_company? :string;
    name_ProductType?: string;
    abbreviation_Measurement?: string;
    code_Product?: string;
    name_Product?: string;
    description_Product?:string;
  }
  export type ProductCreateDto = Omit<Product, 'id' | 'name_ProductType' | 'abbreviation_Measurement'>;
