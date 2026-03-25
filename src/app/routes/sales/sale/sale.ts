import { CommonModule, formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MtxGridColumn, MtxGridModule } from '@ng-matero/extensions/grid';
import { firstValueFrom } from 'rxjs';

import { Customer } from 'src/app/models/customer';
import { DetailSale, DetailSaleCreateDto } from 'src/app/models/detail-sale';
import { Payment } from 'src/app/models/payment';
import { PaymentType } from 'src/app/models/payment-type';
import { CreateSimplePersonDto, PersonSearchResult } from 'src/app/models/person-sale';
import { Sale, SaleCreateDto, SaleSearchDto, SaleUpdateDto } from 'src/app/models/sale';
import { SaleMenu } from 'src/app/models/sale-menu';
import { CustomerService } from 'src/app/service/customer.service';
import { DetailSaleService } from 'src/app/service/detail-sale.service';
import { PaymentService } from 'src/app/service/payment.service';
import { PaymentTypeService } from 'src/app/service/payment-type.service';
import { PersonService } from 'src/app/service/person.service';
import { SaleMenuService } from 'src/app/service/sale-menu.service';
import { SaleService } from 'src/app/service/sale.service';
import { SaleSearchComponent } from '../sale-search/sale-search';

type SaleMode = 'rapida' | 'detallada' | null;
type SaleDrawerMode = 'details' | 'search' | null;

interface Pedido {
  menu: SaleMenu;
  cantidad: number;
  precio: number;
}

interface AdditionalPayment {
  type: number;
  name: string;
  amount: number;
}

interface SaleRow extends Sale {
  dateLabel: string;
}

@Component({
  selector: 'app-sale',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatSidenavModule,
    MatDividerModule,
    MtxGridModule,
    SaleSearchComponent,
  ],
  templateUrl: './sale.html',
  styleUrl: './sale.scss',
})
export class SaleComponent implements OnInit {
  @ViewChild('drawerEnd', { static: true }) drawerEnd!: MatDrawer;
  @ViewChild('dniInput') dniInput?: ElementRef<HTMLInputElement>;
  @ViewChild('telefonoInput') telefonoInput?: ElementRef<HTMLInputElement>;
  @ViewChild('direccionInput') direccionInput?: ElementRef<HTMLInputElement>;
  @ViewChild('codigoMenuInput') codigoMenuInput?: ElementRef<HTMLInputElement>;

  loadingSales = false;
  loadingLookups = false;
  submittingSale = false;
  processingPayments = false;

  saleMode: SaleMode = null;
  drawerMode: SaleDrawerMode = null;
  isFormVisible = false;
  numeroIngresado = '';
  mensajePersona = '';
  personaEncontrada = true;
  personaEncontradaTexto = '';
  resolvedPersonId: number | null = null;
  resolvedPersonDni = '';

  persona = {
    dni: '',
    telefono: '',
    address: '',
  };

  menus: SaleMenu[] = [];
  paymentTypes: PaymentType[] = [];

  sales: Sale[] = [];
  rows: SaleRow[] = [];
  searchDto: SaleSearchDto = {};
  selectedSale: SaleRow | null = null;

  pedidos: Pedido[] = [];

  selectedSaleDetails: DetailSale[] = [];
  additionalPayments: AdditionalPayment[] = [];
  selectedTypePayment = 0;
  amountToPay = 0;
  totalPagado = 0;
  totalVenta = 0;
  selectedSaleForDrawer: SaleRow | null = null;

  columns: MtxGridColumn[] = [
    { header: 'CÃ³digo', field: 'id', minWidth: 60 },
    { header: 'Fecha', field: 'dateLabel', minWidth: 140 },
    { header: 'Total', field: 'total_Sale', minWidth: 80 },
    { header: 'Estado', field: 'status_Sale', minWidth: 90 },
    { header: 'Tipo', field: 'type_Sale', minWidth: 90 },
  ];

  constructor(
    private readonly saleService: SaleService,
    private readonly detailSaleService: DetailSaleService,
    private readonly saleMenuService: SaleMenuService,
    private readonly paymentTypeService: PaymentTypeService,
    private readonly paymentService: PaymentService,
    private readonly personService: PersonService,
    private readonly customerService: CustomerService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.loadSales();
    this.loadMenus();
    this.loadPaymentTypes();
  }

  loadSales(): void {
    this.loadingSales = true;
    this.saleService.getAllSales().subscribe({
      next: sales => {
        this.sales = (sales ?? []).map(s => this.toSale(s)).sort((a, b) => b.id - a.id);
        this.applySearchFilter();
        this.loadingSales = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error al cargar ventas', err);
        this.sales = [];
        this.rows = [];
        this.loadingSales = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadMenus(): void {
    this.loadingLookups = true;
    this.saleMenuService.getAllMenus().subscribe({
      next: menus => {
        this.menus = (menus ?? []).map(menu => this.toMenu(menu));
        this.loadingLookups = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error al cargar menÃº', err);
        this.menus = [];
        this.loadingLookups = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadPaymentTypes(): void {
    this.paymentTypeService.getPaymentTypes().subscribe({
      next: paymentTypes => {
        this.paymentTypes = paymentTypes ?? [];
        if (this.paymentTypes.length > 0 && this.selectedTypePayment <= 0) {
          this.selectedTypePayment = this.paymentTypes[0].id;
        }
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error al cargar tipos de pago', err);
        this.paymentTypes = [];
      },
    });
  }

  applySearchFilter(): void {
    const filtered = this.sales.filter(sale => this.matchesSearch(sale, this.searchDto));

    this.rows = filtered.map(sale => ({
      ...sale,
      dateLabel: this.formatSaleDate(sale.date_Sale),
    }));

    if (this.selectedSale && !this.rows.some(row => row.id === this.selectedSale?.id)) {
      this.selectedSale = null;
    }
  }

  openSearch(): void {
    this.openDrawer('search');
  }

  onSearch(dto: SaleSearchDto): void {
    this.searchDto = dto ?? {};
    this.applySearchFilter();
    this.closeDrawer();
  }

  onGridSelection(event: any): void {
    const raw =
      event?.rowData ??
      event?.record?.data ??
      event?.selected?.[0]?.data ??
      event?.selected?.[0] ??
      event?.record ??
      event?.data ??
      event;

    if (!raw || typeof raw !== 'object') {
      return;
    }

    const sale = this.toSale(raw);
    this.selectedSale = { ...sale, dateLabel: this.formatSaleDate(sale.date_Sale) };
    this.cdr.detectChanges();
  }

  openSaleForm(mode: SaleMode): void {
    this.saleMode = mode;
    this.isFormVisible = true;
    this.mensajePersona = '';
    this.personaEncontrada = true;
    this.personaEncontradaTexto = '';
    this.resolvedPersonId = null;
    this.resolvedPersonDni = '';
  }

  closeSaleForm(): void {
    this.isFormVisible = false;
    this.saleMode = null;
    this.numeroIngresado = '';
    this.pedidos = [];
    this.mensajePersona = '';
    this.personaEncontradaTexto = '';
    this.resolvedPersonId = null;
    this.resolvedPersonDni = '';
    this.persona = { dni: '', telefono: '', address: '' };
  }

  onNumericKey(digit: string): void {
    this.numeroIngresado += digit;
  }

  onClearCode(): void {
    this.numeroIngresado = '';
  }

  addOrderByCode(): void {
    const code = this.numeroIngresado.trim();
    if (!code) {
      alert('Ingrese un cÃ³digo de menÃº');
      return;
    }

    const foundMenu = this.menus.find(menu => String(menu.code_Menu) === code);
    if (!foundMenu) {
      alert('No existe menÃº con ese cÃ³digo');
      return;
    }

    this.addMenuToOrder(foundMenu);
    this.numeroIngresado = '';
  }

  addMenuToOrder(menu: SaleMenu): void {
    const existing = this.pedidos.find(pedido => pedido.menu.id === menu.id);
    if (existing) {
      existing.cantidad += 1;
      existing.precio = existing.cantidad * Number(menu.price_Menu);
      return;
    }

    this.pedidos.push({
      menu,
      cantidad: 1,
      precio: Number(menu.price_Menu),
    });
  }

  updatePedidoCantidad(index: number, quantity: number): void {
    const pedido = this.pedidos[index];
    if (!pedido) return;

    const safeQty = Math.max(1, Math.floor(Number(quantity) || 1));
    pedido.cantidad = safeQty;
    pedido.precio = safeQty * Number(pedido.menu.price_Menu);
  }

  removePedido(index: number): void {
    this.pedidos.splice(index, 1);
  }

  calcularTotalPedidos(): number {
    return this.pedidos.reduce((sum, pedido) => sum + Number(pedido.precio), 0);
  }

  async saveSale(): Promise<void> {
    if (this.submittingSale) return;
    if (!this.saleMode) return;

    if (this.pedidos.length === 0) {
      alert('Debe agregar al menos un producto a la venta');
      return;
    }

    this.submittingSale = true;

    try {
      let customerId = 1;
      let saleType = 'Mesa';

      if (this.saleMode === 'detallada') {
        saleType = 'Delivery';
        const resolvedCustomerId = await this.resolveCustomerIdForDetailedSale();
        if (!resolvedCustomerId) {
          this.submittingSale = false;
          return;
        }
        customerId = resolvedCustomerId;
      }

      const salePayload: SaleCreateDto = {
        customerId,
        date_Sale: new Date().toISOString(),
        total_Sale: this.calcularTotalPedidos(),
        status_Sale: 'Creado',
        type_Sale: saleType,
      };

      const createdSale = await firstValueFrom(this.saleService.addSale(salePayload));
      let saleId = this.extractCreatedSaleId(createdSale);

      if (!saleId) {
        const allSales = await firstValueFrom(this.saleService.getAllSales());
        const mapped = (allSales ?? []).map(s => this.toSale(s));
        saleId = mapped.reduce((max, s) => Math.max(max, this.toNumber((s as any)?.id)), 0);
      }

      if (!saleId) {
        throw new Error('No se pudo obtener el ID de la venta creada');
      }

      const detailRequests = this.pedidos.map(pedido => {
        const detailPayload: DetailSaleCreateDto = {
          saleId,
          menuId: pedido.menu.id,
          amount_DetailSale: pedido.cantidad,
          unitPrice_DetailSale: Number(pedido.menu.price_Menu),
          subtotal_DetailSale: Number(pedido.precio),
        };
        return firstValueFrom(this.detailSaleService.addDetailSale(detailPayload));
      });

      await Promise.all(detailRequests);

      this.closeSaleForm();
      this.loadSales();
      this.cdr.detectChanges();
      alert('Venta registrada correctamente');
    } catch (error) {
      console.error('Error al registrar venta', error);
      alert('No se pudo registrar la venta');
    } finally {
      this.submittingSale = false;
    }
  }

  async openDetails(): Promise<void> {
    if (!this.selectedSale) {
      return;
    }

    await this.openDetailsForSale(this.selectedSale);
  }

  private async openDetailsForSale(sale: SaleRow): Promise<void> {
    this.drawerMode = 'details';
    this.selectedSaleForDrawer = sale;
    this.selectedSaleDetails = [];
    this.additionalPayments = [];
    this.totalPagado = 0;
    this.totalVenta = 0;
    this.amountToPay = 0;

    try {
      const details = await firstValueFrom(this.detailSaleService.getDetailSaleBySaleId(sale.id));
      this.selectedSaleDetails = (details ?? []).map(d => this.toDetail(d));
    } catch (error) {
      console.error('Error al cargar detalles de venta', error);
      this.selectedSaleDetails = [];
    }

    this.totalVenta = this.calcularTotalDetalleVenta();

    this.additionalPayments = await this.fetchAdditionalPayments(sale.id);

    this.totalPagado = this.additionalPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    this.amountToPay = Math.max(this.totalVenta - this.totalPagado, 0);

    this.drawerEnd.open();
  }

  closeDetails(): void {
    this.closeDrawer();
  }

  closeDrawer(): void {
    if (this.drawerMode === 'details') {
      this.resetDetailDrawerState();
    }
    this.drawerEnd.close();
    this.drawerMode = null;
  }

  private openDrawer(mode: SaleDrawerMode): void {
    const isSameMode = this.drawerMode === mode;
    if (this.drawerEnd.opened && isSameMode) {
      this.closeDrawer();
      return;
    }

    this.drawerMode = mode;
    this.drawerEnd.open();
  }

  private matchesSearch(sale: Sale, dto: SaleSearchDto): boolean {
    if (!dto) return true;

    const byCode = dto.code_Sale ? sale.id === dto.code_Sale : true;
    const byTotal = dto.total_Sale !== undefined ? Number(sale.total_Sale) === Number(dto.total_Sale) : true;
    const byStatus = dto.status_Sale
      ? this.toString(sale.status_Sale).toLowerCase().includes(dto.status_Sale.toLowerCase())
      : true;
    const byType = dto.type_Sale
      ? this.toString(sale.type_Sale).toLowerCase().includes(dto.type_Sale.toLowerCase())
      : true;

    const saleDate = this.parseDateOnly(sale.date_Sale);
    const startDate = this.parseDateOnly(dto.startDate);
    const endDate = this.parseDateOnly(dto.endDate);
    const byStartDate = startDate ? !!saleDate && saleDate >= startDate : true;
    const byEndDate = endDate ? !!saleDate && saleDate <= endDate : true;

    return byCode && byTotal && byStatus && byType && byStartDate && byEndDate;
  }

  private parseDateOnly(value: string | Date | undefined): Date | null {
    if (!value) return null;
    const base = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(base.getTime())) return null;
    return new Date(base.getFullYear(), base.getMonth(), base.getDate());
  }

  clearSearch(): void {
    this.searchDto = {};
    this.applySearchFilter();
  }

  hasActiveSearch(): boolean {
    const dto = this.searchDto;
    return !!(
      dto.code_Sale ||
      dto.startDate ||
      dto.endDate ||
      dto.total_Sale !== undefined ||
      dto.status_Sale ||
      dto.type_Sale
    );
  }

  getSearchSummary(): string {
    const dto = this.searchDto;
    const parts: string[] = [];

    if (dto.code_Sale) parts.push(`Código: ${dto.code_Sale}`);
    if (dto.startDate) parts.push(`Desde: ${dto.startDate}`);
    if (dto.endDate) parts.push(`Hasta: ${dto.endDate}`);
    if (dto.total_Sale !== undefined) parts.push(`Total: ${dto.total_Sale}`);
    if (dto.status_Sale) parts.push(`Estado: ${dto.status_Sale}`);
    if (dto.type_Sale) parts.push(`Tipo: ${dto.type_Sale}`);

    return parts.join(' | ');
  }

  private resetDetailDrawerState(): void {
    this.selectedSaleForDrawer = null;
    this.selectedSaleDetails = [];
    this.additionalPayments = [];
    this.totalPagado = 0;
    this.totalVenta = 0;
    this.amountToPay = 0;
  }

  calcularTotalDetalleVenta(): number {
    return this.selectedSaleDetails.reduce((acc, detail) => acc + Number(detail.subtotal_DetailSale), 0);
  }

  updateAmountByPaymentType(): void {
    const remaining = Math.max(this.totalVenta - this.totalPagado, 0);
    if (this.selectedTypePayment === 3) {
      this.amountToPay = Number((remaining * 1.05).toFixed(2));
      return;
    }
    this.amountToPay = remaining;
  }

  addPaymentLine(): void {
    const amount = Number(this.amountToPay);
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    const remaining = Math.max(this.totalVenta - this.totalPagado, 0);
    if (this.selectedTypePayment !== 3 && amount > remaining) {
      alert('El monto a pagar no puede exceder el pendiente');
      return;
    }

    const idx = this.additionalPayments.findIndex(payment => payment.type === this.selectedTypePayment);
    if (idx >= 0) {
      this.additionalPayments[idx].amount += amount;
    } else {
      this.additionalPayments.push({
        type: this.selectedTypePayment,
        name: this.getPaymentTypeName(this.selectedTypePayment),
        amount,
      });
    }

    this.totalPagado = this.additionalPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    this.amountToPay = Math.max(this.totalVenta - this.totalPagado, 0);
  }

  removePaymentLine(index: number): void {
    this.additionalPayments.splice(index, 1);
    this.totalPagado = this.additionalPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    this.amountToPay = Math.max(this.totalVenta - this.totalPagado, 0);
  }

  async confirmPaymentsAndPrint(): Promise<void> {
    if (!this.selectedSaleForDrawer || this.processingPayments) {
      return;
    }

    const sale = this.selectedSaleForDrawer;
    this.processingPayments = true;

    try {
      if (this.selectedSaleDetails.length === 0) {
        const details = await firstValueFrom(this.detailSaleService.getDetailSaleBySaleId(sale.id));
        this.selectedSaleDetails = (details ?? []).map(d => this.toDetail(d));
      }
      this.totalVenta = this.calcularTotalDetalleVenta();

      const existingPayments = await this.fetchAdditionalPayments(sale.id);
      if (existingPayments.length > 0) {
        this.additionalPayments = existingPayments;
        this.totalPagado = this.additionalPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        this.amountToPay = Math.max(this.totalVenta - this.totalPagado, 0);
        await this.markSaleAsPaid(sale);
        this.printSale(sale, this.selectedSaleDetails, this.additionalPayments);
        this.closeDetails();
        this.loadSales();
        return;
      }

      const pending = Math.max(this.totalVenta - this.totalPagado, 0);
      let paymentLines = [...this.additionalPayments];
      if (paymentLines.length === 0 && pending > 0) {
        paymentLines = [{
          type: this.selectedTypePayment || 1,
          name: this.getPaymentTypeName(this.selectedTypePayment || 1),
          amount: pending,
        }];
      }

      if (paymentLines.length === 0) {
        alert('No hay pagos para procesar');
        return;
      }

      const hasInvalidLine = paymentLines.some(paymentLine =>
        !Number.isFinite(Number(paymentLine.amount))
        || Number(paymentLine.amount) <= 0
        || !Number.isFinite(Number(paymentLine.type))
        || Number(paymentLine.type) <= 0
      );
      if (hasInvalidLine) {
        alert('Hay pagos inválidos. Verifique tipo y monto.');
        return;
      }

      for (const paymentLine of paymentLines) {
        const paymentPayload: Payment = {
          cashRegisterId: 1,
          saleId: sale.id,
          paymentTypeId: paymentLine.type,
          amount_Payment: Number(paymentLine.amount),
          date_Payment: new Date().toISOString(),
          status_Payment: 'Pagado',
        };
        await firstValueFrom(this.paymentService.addPayment(paymentPayload));
      }

      const persistedPayments = await this.fetchAdditionalPayments(sale.id);
      this.additionalPayments = persistedPayments.length > 0 ? persistedPayments : paymentLines;
      this.totalPagado = this.additionalPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      this.amountToPay = Math.max(this.totalVenta - this.totalPagado, 0);

      await this.markSaleAsPaid(sale);

      this.printSale(sale, this.selectedSaleDetails, this.additionalPayments);
      this.closeDetails();
      this.loadSales();
    } catch (error) {
      console.error('Error al registrar pagos', error);
      alert('No se pudo completar el flujo de pago e impresión');
    } finally {
      this.processingPayments = false;
    }
  }

  async payAndPrintDirect(): Promise<void> {
    if (!this.selectedSale) {
      return;
    }

    await this.openDetailsForSale(this.selectedSale);
    await this.confirmPaymentsAndPrint();
  }

  async deleteSelectedSale(): Promise<void> {
    const sale = this.selectedSale;
    if (!sale) {
      alert('Seleccione una venta para eliminar');
      return;
    }

    const saleId = this.toNumber(
      (sale as any)?.id ??
        (sale as any)?.Id ??
        (sale as any)?.row?.id ??
        (sale as any)?.row?.Id ??
        (sale as any)?.record?.id ??
        (sale as any)?.record?.Id
    );
    if (!saleId) {
      alert('No se pudo identificar la venta seleccionada');
      return;
    }

    const status = this.toString(
      (sale as any)?.status_Sale ??
        (sale as any)?.Status_Sale ??
        (sale as any)?.row?.status_Sale ??
        (sale as any)?.row?.Status_Sale ??
        (sale as any)?.record?.status_Sale ??
        (sale as any)?.record?.Status_Sale
    ).toLowerCase();
    if (status === 'pagado') {
      alert('No se puede eliminar una venta pagada');
      return;
    }

    const ok = confirm(`¿Eliminar la venta ${saleId}?`);
    if (!ok) {
      return;
    }

    this.saleService.deleteSale(saleId).subscribe({
      next: () => {
        alert('Venta eliminada correctamente');
        this.selectedSale = null;
        this.selectedSaleForDrawer = null;
        this.loadSales();
      },
      error: err => {
        console.error('Error al eliminar venta', err);
        alert('No se pudo eliminar la venta');
      },
    });
  }

  async searchPersonaByDni(): Promise<void> {
    const dni = this.persona.dni.trim();
    if (!dni) {
      this.mensajePersona = '';
      this.personaEncontrada = true;
      this.personaEncontradaTexto = '';
      this.resolvedPersonId = null;
      this.resolvedPersonDni = '';
      this.cdr.detectChanges();
      return;
    }

    try {
      const person = await firstValueFrom(this.personService.searchPerson(dni));
      if (!person) {
        this.personaEncontrada = false;
        this.mensajePersona = 'Persona no encontrada';
        this.personaEncontradaTexto = '';
        this.resolvedPersonId = null;
        this.resolvedPersonDni = '';
        this.persona.telefono = '';
        this.persona.address = '';
        this.cdr.detectChanges();
        return;
      }
      console.log('Persona encontrada por DNI:', person);
      this.assignPersonSearchResult(person);
      this.resolvedPersonId = this.toNumber((person as any).id ?? (person as any).Id, 0) || null;
      this.resolvedPersonDni = this.persona.dni.trim();
      this.personaEncontrada = true;
      this.mensajePersona = '';
      this.personaEncontradaTexto = this.formatPersonFoundText(person);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al buscar persona', error);
      this.mensajePersona = 'Error al buscar persona';
      this.personaEncontradaTexto = '';
      this.resolvedPersonId = null;
      this.resolvedPersonDni = '';
      this.cdr.detectChanges();
    }
  }

  onTelefonoEnter(): void {
    this.direccionInput?.nativeElement.focus();
  }

  onDniEnter(): void {
    this.telefonoInput?.nativeElement.focus();
  }

  async onDireccionEnter(): Promise<void> {
    await this.createSimplePersonFromInputs();
    this.codigoMenuInput?.nativeElement.focus();
  }

  private async createSimplePersonFromInputs(): Promise<void> {
    const dni = this.persona.dni.trim();
    const telefono = this.persona.telefono.trim();
    const address = this.persona.address.trim();

    if (!dni || !telefono || !address) {
      this.personaEncontrada = false;
      this.mensajePersona = 'Complete DNI, celular y direccion para crear la persona.';
      this.personaEncontradaTexto = '';
      this.cdr.detectChanges();
      return;
    }

    try {
      const existing = await firstValueFrom(this.personService.searchPerson(dni));
      if (existing) {
        this.assignPersonSearchResult(existing);
        this.resolvedPersonId = this.toNumber((existing as any).id ?? (existing as any).Id, 0) || null;
        this.resolvedPersonDni = this.persona.dni.trim();
        this.personaEncontrada = true;
        this.mensajePersona = '';
        this.personaEncontradaTexto = this.formatPersonFoundText(existing);
        this.cdr.detectChanges();
        return;
      }
    } catch (error) {
      console.error('Error al validar persona antes de crear', error);
      this.mensajePersona = 'No se pudo validar la persona';
      this.personaEncontradaTexto = '';
      this.cdr.detectChanges();
      return;
    }

    const payload: CreateSimplePersonDto = {
      DocumentNumber_Person: dni,
      PhoneNumber_Person: telefono,
      Address_Person: address,
    };

    try {
      const created = await firstValueFrom(this.personService.createSimplePerson(payload));
      const createdId = this.toNumber((created as any)?.id ?? (created as any)?.Id);
      if (!createdId) {
        this.personaEncontrada = false;
        this.mensajePersona = 'No se pudo crear la persona';
        this.personaEncontradaTexto = '';
        this.cdr.detectChanges();
        return;
      }

      this.resolvedPersonId = createdId;
      this.resolvedPersonDni = this.persona.dni.trim();
      this.personaEncontrada = true;
      this.mensajePersona = '';
      this.personaEncontradaTexto = 'Persona creada correctamente';
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al crear persona', error);
      this.personaEncontrada = false;
      this.mensajePersona = 'No se pudo crear la persona';
      this.personaEncontradaTexto = '';
      this.resolvedPersonId = null;
      this.resolvedPersonDni = '';
      this.cdr.detectChanges();
    }
  }

  private async resolveCustomerIdForDetailedSale(): Promise<number | null> {
    if (!this.resolvedPersonId || this.resolvedPersonId <= 0) {
      this.mensajePersona =
        'Primero busque por DNI o cree la persona con Enter en dirección para continuar.';
      return null;
    }
    if (this.persona.dni.trim() !== this.resolvedPersonDni) {
      this.mensajePersona = 'El DNI cambió. Vuelva a buscar/crear la persona para continuar.';
      return null;
    }

    const personId = this.resolvedPersonId;

    try {
      const customer = await firstValueFrom(this.customerService.verifyCustomer(personId));
      return this.toNumber((customer as any).id ?? (customer as any).Id);
    } catch (error) {
      if (!this.isNotFound(error)) {
        console.error('Error al verificar cliente', error);
        this.mensajePersona = 'No se pudo verificar el cliente';
        return null;
      }

      try {
        const created = await firstValueFrom(this.customerService.createCustomer(personId));
        return this.toNumber((created as any).id ?? (created as any).Id);
      } catch (createError) {
        console.error('Error al crear cliente', createError);
        this.mensajePersona = 'No se pudo crear el cliente';
        return null;
      }
    }
  }

  private assignPersonSearchResult(person: PersonSearchResult): void {
    this.persona.address = this.toString(
      (person as any).address_person ??
        (person as any).Address_Person ??
        (person as any).address_Person
    );
    this.persona.telefono = this.toString(
      (person as any).phone_number_person ??
        (person as any).PhoneNumber_Person ??
        (person as any).phoneNumber_Person
    );
    this.persona.dni = this.toString(
      (person as any).document_number_person ??
        (person as any).DocumentNumber_Person ??
        (person as any).documentNumber_Person ??
        this.persona.dni
    );
  }

  private formatPersonFoundText(person: PersonSearchResult): string {
    const names = this.toString((person as any).names_person ?? (person as any).Names_Person).trim();
    const lastName = this.toString((person as any).last_name_person ?? (person as any).LastName_Person).trim();
    const secondLastName = this.toString(
      (person as any).second_last_name_person ?? (person as any).SecondLastName_Person
    ).trim();
    const fullName = [names, lastName, secondLastName].filter(part => part.length > 0).join(' ');
    return fullName ? `Persona encontrada: ${fullName}` : 'Persona encontrada';
  }

  private printSale(sale: SaleRow, details: DetailSale[], payments: AdditionalPayment[]): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return;
    }

    const detailsRows = details
      .map(detail => {
        const menuName = this.getMenuDescription(detail.menuId);
        return `<tr><td>${detail.amount_DetailSale}</td><td>${menuName}</td><td>${detail.unitPrice_DetailSale}</td><td>${detail.subtotal_DetailSale}</td></tr>`;
      })
      .join('');

    const paymentRows = payments
      .map(payment => `<tr><td>${payment.name}</td><td>${payment.amount.toFixed(2)}</td></tr>`)
      .join('');

    const total = details.reduce((sum, detail) => sum + Number(detail.subtotal_DetailSale), 0);

    printWindow.document.write(`
      <html>
      <head>
        <title>Comprobante venta #${sale.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 12px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
          h2, h3, p { margin: 6px 0; }
          .right { text-align: right; }
        </style>
      </head>
      <body>
        <h2>Comprobante de Venta</h2>
        <p><strong>Venta:</strong> ${sale.id}</p>
        <p><strong>Fecha:</strong> ${this.formatSaleDate(sale.date_Sale)}</p>
        <p><strong>Tipo:</strong> ${sale.type_Sale}</p>
        <h3>Detalle</h3>
        <table>
          <thead><tr><th>Cant.</th><th>Producto</th><th>P.Unit</th><th>Subtotal</th></tr></thead>
          <tbody>${detailsRows}</tbody>
        </table>
        <h3>Pagos</h3>
        <table>
          <thead><tr><th>Tipo</th><th>Monto</th></tr></thead>
          <tbody>${paymentRows}</tbody>
        </table>
        <p class="right"><strong>Total: S/. ${total.toFixed(2)}</strong></p>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  getMenuDescription(menuId: number): string {
    const menu = this.menus.find(item => item.id === menuId);
    return menu?.name_Menu ?? `Menu #${menuId}`;
  }

  getPaymentTypeName(paymentTypeId: number): string {
    const paymentType = this.paymentTypes.find(type => type.id === paymentTypeId);
    return paymentType?.name_PaymentType ?? `Tipo ${paymentTypeId}`;
  }

  private async fetchAdditionalPayments(saleId: number): Promise<AdditionalPayment[]> {
    try {
      const payments = await firstValueFrom(this.paymentService.getPaymentsBySaleId(saleId));
      const mapped = (payments ?? []).map(payment => this.toPayment(payment));
      return mapped.map(payment => ({
        type: payment.paymentTypeId,
        name: this.getPaymentTypeName(payment.paymentTypeId),
        amount: Number(payment.amount_Payment),
      }));
    } catch (error) {
      if (!this.isNotFound(error)) {
        console.error('Error al cargar pagos de venta', error);
      }
      return [];
    }
  }

  private async markSaleAsPaid(sale: SaleRow): Promise<void> {
    const updatePayload: SaleUpdateDto = {
      id: sale.id,
      customerId: sale.customerId,
      date_Sale: this.toIsoDate(sale.date_Sale),
      total_Sale: sale.total_Sale,
      status_Sale: 'Pagado',
      type_Sale: sale.type_Sale,
    };

    try {
      await firstValueFrom(this.saleService.updateSale(sale.id, updatePayload));
    } catch (error) {
      console.error('Error al actualizar venta, reintentando por estado', error);
      await firstValueFrom(this.saleService.updateSaleStatus(sale.id, 'Pagado'));
    }
  }

  private toSale(raw: any): Sale {
    return {
      id: this.toNumber(raw?.id ?? raw?.Id),
      customerId: this.toNumber(raw?.customerId ?? raw?.CustomerId),
      date_Sale: raw?.date_Sale ?? raw?.Date_Sale ?? '',
      total_Sale: this.toNumber(raw?.total_Sale ?? raw?.Total_Sale),
      status_Sale: this.toString(raw?.status_Sale ?? raw?.Status_Sale),
      type_Sale: this.toString(raw?.type_Sale ?? raw?.Type_Sale),
    };
  }

  private toDetail(raw: any): DetailSale {
    return {
      id: this.toNumber(raw?.id ?? raw?.Id),
      saleId: this.toNumber(raw?.saleId ?? raw?.SaleId),
      menuId: this.toNumber(raw?.menuId ?? raw?.MenuId),
      amount_DetailSale: this.toNumber(raw?.amount_DetailSale ?? raw?.Amount_DetailSale),
      unitPrice_DetailSale: this.toNumber(raw?.unitPrice_DetailSale ?? raw?.UnitPrice_DetailSale),
      subtotal_DetailSale: this.toNumber(raw?.subtotal_DetailSale ?? raw?.Subtotal_DetailSale),
    };
  }

  private toPayment(raw: any): Payment {
    return {
      id: this.toNumber(raw?.id ?? raw?.Id),
      saleId: this.toNumber(raw?.saleId ?? raw?.SaleId),
      cashRegisterId: this.toNumber(raw?.cashRegisterId ?? raw?.CashRegisterId),
      paymentTypeId: this.toNumber(raw?.paymentTypeId ?? raw?.PaymentTypeId),
      amount_Payment: this.toNumber(raw?.amount_Payment ?? raw?.Amount_Payment),
      date_Payment: this.toString(raw?.date_Payment ?? raw?.Date_Payment),
      status_Payment: this.toString(raw?.status_Payment ?? raw?.Status_Payment),
    };
  }

  private toMenu(raw: any): SaleMenu {
    return {
      id: this.toNumber(raw?.id ?? raw?.Id),
      code_Menu: this.toNumber(raw?.code_Menu ?? raw?.Code_Menu),
      name_Menu: this.toString(raw?.name_Menu ?? raw?.Name_Menu),
      description_Menu: this.toString(raw?.description_Menu ?? raw?.Description_Menu),
      price_Menu: this.toNumber(raw?.price_Menu ?? raw?.Price_Menu),
    };
  }

  private formatSaleDate(value: string | Date): string {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }
    return formatDate(date, 'dd/MM/yyyy HH:mm:ss', 'es-PE');
  }

  private extractCreatedSaleId(raw: any): number {
    const candidate =
      raw?.id ??
      raw?.Id ??
      raw?.saleId ??
      raw?.SaleId ??
      raw?.data?.id ??
      raw?.data?.Id ??
      raw?.data?.saleId ??
      raw?.data?.SaleId ??
      raw;
    return this.toNumber(candidate, 0);
  }

  private toIsoDate(value: string | Date): string {
    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  }

  private toNumber(value: unknown, fallback = 0): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private toString(value: unknown, fallback = ''): string {
    if (value === null || value === undefined) {
      return fallback;
    }
    return String(value);
  }

  private isNotFound(error: unknown): boolean {
    return error instanceof HttpErrorResponse && error.status === 404;
  }
}

