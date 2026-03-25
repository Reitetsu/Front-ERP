import { CommonModule, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MtxGridColumn, MtxGridModule } from '@ng-matero/extensions/grid';

import { PaymentSearchDto, PaymentWithDetails } from 'src/app/models/payment';
import { PaymentService } from 'src/app/service/payment.service';
import { ExcelExportService } from 'src/app/utilities/excel-export.service';
import { PaymentSearchComponent } from '../payment-search/payment-search';

interface PaymentRow extends PaymentWithDetails {
  dateLabel: string;
}

type DrawerMode = 'search' | null;

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSidenavModule,
    MtxGridModule,
    PaymentSearchComponent,
  ],
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
})
export class PaymentsComponent implements OnInit {
  @ViewChild('drawerEnd', { static: true }) drawerEnd!: MatDrawer;

  drawerMode: DrawerMode = null;
  loading = false;

  columns: MtxGridColumn[] = [
    { header: 'Id', field: 'id', minWidth: 70 },
    { header: 'Caja', field: 'cashRegisterId', minWidth: 80 },
    { header: 'Venta', field: 'saleId', minWidth: 80 },
    { header: 'Tipo Pago', field: 'paymentTypeId', minWidth: 90 },
    { header: 'Monto', field: 'amount_Payment', minWidth: 90 },
    { header: 'Fecha Pago', field: 'dateLabel', minWidth: 170 },
    { header: 'Estado', field: 'status_Payment', minWidth: 110 },
  ];

  private allPayments: PaymentRow[] = [];
  rows: PaymentRow[] = [];
  selectedPayment: PaymentRow | null = null;

  searchDto: PaymentSearchDto = {};
  currentPage = 1;
  itemsPerPage = 25;
  totalItems = 0;
  private suppressInitialPageEvent = true;

  constructor(
    private readonly paymentService: PaymentService,
    private readonly excelExportService: ExcelExportService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.suppressInitialPageEvent = false;
    this.loadPayments();
  }

  private toggleDrawer(mode: DrawerMode): void {
    const isSameMode = this.drawerMode === mode;
    if (this.drawerEnd.opened && isSameMode) {
      this.closeDrawer();
      return;
    }

    this.drawerMode = mode;
    this.drawerEnd.open();
  }

  openSearch(): void {
    this.toggleDrawer('search');
  }

  closeDrawer(): void {
    this.drawerEnd.close();
    this.drawerMode = null;
  }

  loadPayments(): void {
    this.loading = true;
    this.paymentService.getAllPaymentSales().subscribe({
      next: payments => {
        this.allPayments = (payments ?? [])
          .map(payment => this.toPaymentRow(payment))
          .sort((a, b) => Number(b.id) - Number(a.id));
        this.applyFiltersAndPaging();
      },
      error: err => {
        console.error('Error al cargar pagos', err);
        this.allPayments = [];
        this.applyGridData([], 0);
      },
    });
  }

  onSearch(dto: PaymentSearchDto): void {
    this.currentPage = 1;
    this.searchDto = dto ?? {};
    this.applyFiltersAndPaging();
    this.closeDrawer();
  }

  private applyFiltersAndPaging(): void {
    const filtered = this.allPayments.filter(payment => this.matchesSearch(payment, this.searchDto));
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.applyGridData(filtered.slice(start, end), filtered.length);
  }

  private applyGridData(mapped: PaymentRow[], total: number): void {
    this.selectedPayment = null;
    this.rows = [...mapped];
    this.totalItems = total;
    this.loading = false;
    this.cdr.detectChanges();
  }

  private matchesSearch(payment: PaymentRow, dto: PaymentSearchDto): boolean {
    const id = this.toNullableNumber(dto?.id);
    if (id !== null && payment.id !== id) return false;

    const cashRegisterId = this.toNullableNumber(dto?.cashRegisterId);
    if (cashRegisterId !== null && payment.cashRegisterId !== cashRegisterId) return false;

    const saleId = this.toNullableNumber(dto?.saleId);
    if (saleId !== null && payment.saleId !== saleId) return false;

    const paymentTypeId = this.toNullableNumber(dto?.paymentTypeId);
    if (paymentTypeId !== null && payment.paymentTypeId !== paymentTypeId) return false;

    const amountFrom = this.toNullableNumber(dto?.amountFrom);
    if (amountFrom !== null && payment.amount_Payment < amountFrom) return false;

    const amountTo = this.toNullableNumber(dto?.amountTo);
    if (amountTo !== null && payment.amount_Payment > amountTo) return false;

    const dateFrom = this.toDateStart(dto?.dateFrom);
    const paymentDate = this.toDate(payment.date_Payment);
    if (dateFrom && (!paymentDate || paymentDate.getTime() < dateFrom.getTime())) return false;

    const dateTo = this.toDateEnd(dto?.dateTo);
    if (dateTo && (!paymentDate || paymentDate.getTime() > dateTo.getTime())) return false;

    const status = this.toString(dto?.status).trim().toLowerCase();
    if (status && !this.toString(payment.status_Payment).toLowerCase().includes(status)) return false;

    return true;
  }

  onGridSelection(event: any): void {
    const raw = event?.row ?? event?.record ?? event?.rowData ?? event?.record?.data ?? event;
    if (!raw || typeof raw !== 'object') {
      return;
    }
    this.selectedPayment = this.toPaymentRow(raw);
  }

  onGridPageChange(e: any): void {
    if (this.suppressInitialPageEvent) return;
    if (this.loading) return;

    const pageIndex = Number(e?.pageIndex ?? 0);
    const pageSize = Number(e?.pageSize ?? this.itemsPerPage);
    this.currentPage = pageIndex + 1;
    this.itemsPerPage = pageSize;
    this.applyFiltersAndPaging();
  }

  downloadExcel(): void {
    if (this.rows.length === 0) {
      return;
    }

    this.excelExportService.exportToExcel(this.rows, 'pagos', {
      id: 'Id',
      cashRegisterId: 'Caja',
      saleId: 'Venta',
      paymentTypeId: 'TipoPago',
      amount_Payment: 'Monto',
      dateLabel: 'FechaPago',
      status_Payment: 'Estado',
    });
  }

  private toPaymentRow(raw: any): PaymentRow {
    const source = raw?.data ?? raw;
    const dateRaw = this.toString(source?.date_Payment ?? source?.Date_Payment);

    return {
      id: this.toNumber(source?.id ?? source?.Id),
      cashRegisterId: this.toNumber(source?.cashRegisterId ?? source?.CashRegisterId),
      saleId: this.toNumber(source?.saleId ?? source?.SaleId),
      paymentTypeId: this.toNumber(source?.paymentTypeId ?? source?.PaymentTypeId),
      amount_Payment: this.toNumber(source?.amount_Payment ?? source?.Amount_Payment),
      date_Payment: dateRaw,
      status_Payment: this.toString(source?.status_Payment ?? source?.Status_Payment),
      cashRegisterName: this.toString(source?.cashRegisterName ?? source?.CashRegisterName),
      paymentTypeName: this.toString(source?.paymentTypeName ?? source?.PaymentTypeName),
      dateLabel: this.formatDateLabel(dateRaw),
    };
  }

  private formatDateLabel(value: string): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return formatDate(date, 'dd/MM/yyyy HH:mm:ss', 'es-PE');
  }

  private toNumber(value: unknown): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  private toNullableNumber(value: unknown): number | null {
    const text = this.toString(value).trim();
    if (!text) return null;
    const n = Number(text);
    return Number.isFinite(n) ? n : null;
  }

  private toDate(value: unknown): Date | null {
    const text = this.toString(value).trim();
    if (!text) return null;
    const d = new Date(text);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  private toDateStart(value: unknown): Date | null {
    const text = this.toString(value).trim();
    if (!text) return null;
    const d = new Date(`${text}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  private toDateEnd(value: unknown): Date | null {
    const text = this.toString(value).trim();
    if (!text) return null;
    const d = new Date(`${text}T23:59:59.999`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  private toString(value: unknown): string {
    return value == null ? '' : String(value);
  }
}
