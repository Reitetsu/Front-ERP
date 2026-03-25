export interface Payment {
  id?: number;
  cashRegisterId: number;
  saleId: number;
  paymentTypeId: number;
  amount_Payment: number;
  date_Payment: string;
  status_Payment: string;
}

export interface PaymentWithDetails {
  id: number;
  cashRegisterId: number;
  saleId: number;
  cashRegisterName: string;
  paymentTypeId: number;
  paymentTypeName: string;
  amount_Payment: number;
  date_Payment: string;
  status_Payment: string;
}

export interface PaymentSearchDto {
  id?: number | null;
  cashRegisterId?: number | null;
  saleId?: number | null;
  paymentTypeId?: number | null;
  amountFrom?: number | null;
  amountTo?: number | null;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}
