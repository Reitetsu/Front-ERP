import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

import { Product, ProductSearchDto, ProductCreateDto, ProductUpdateDto } from 'src/app/models/product';
import { Measurement } from 'src/app/models/measurement';
import { ProductType } from 'src/app/models/product-type';

import { ProductService } from 'src/app/service/product.service';
import { MeasurementService } from 'src/app/service/measurement.service';
import { ProductTypeService } from 'src/app/service/product-type.service';
import { UserService } from 'src/app/service/user.service';
import { ExcelExportService } from 'src/app/utilities/excel-export.service';

import { ProductoAdd } from '../producto-add/producto-add';
import { ProductoEdit } from '../producto-edit/producto-edit';
import { ProductoSearch } from '../producto-search/producto-search';
import { MtxGridColumn, MtxGridModule } from '@ng-matero/extensions/grid';

type DrawerMode = 'add' | 'search' | 'edit' | null;

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSidenavModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    ProductoAdd,
    ProductoEdit,
    ProductoSearch,
    MtxGridModule,
  ],
  templateUrl: './product.html',
  styleUrl: './product.scss',
})
export class ProductComponent implements OnInit {
  @ViewChild('drawerEnd', { static: true }) drawerEnd!: MatDrawer;
  drawerMode: DrawerMode = null;
  gridReady = false;
  private suppressInitialPageEvent = true;

  loading = false;
  trackById = (_: number, item: any) => item?.id;

  columns: MtxGridColumn[] = [
    { header: 'EAN', field: 'barcode_Product', minWidth: 50 },
    { header: 'SKU', field: 'code_Product', minWidth: 50 },
    { header: 'Descripción', field: 'name_Product', minWidth: 50 },
    { header: 'Tipo', field: 'name_ProductType', minWidth: 50 },
    { header: 'Medida', field: 'abbreviation_Measurement', minWidth: 50 },
    { header: 'Precio', field: 'price_Product', minWidth: 50 },
    { header: 'Stock', field: 'stock_Product', minWidth: 50, resizable: false },
  ];

  rows: Product[] = [];
  searchDto: ProductSearchDto = {};
  currentPage = 1;
  itemsPerPage = 25;
  totalItems = 0;

  selectedRow: Product | null = null;
  selectedProduct: Product | null = null;
  isRowSelected = false;

  measurements: Measurement[] = [];
  productTypes: ProductType[] = [];

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private measurementService: MeasurementService,
    private productTypeService: ProductTypeService,
    private excelExportService: ExcelExportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.gridReady = true;
    this.suppressInitialPageEvent = false;
    this.initializeSearchDto();
    this.ensureLookupsLoaded();
    this.loadProducts(this.searchDto);
  }

  private applyGridData(mapped: Product[], total: number): void {
    this.selectedRow = null;
    this.selectedProduct = null;
    this.isRowSelected = false;
    this.rows = [...mapped];
    this.totalItems = total;
    this.loading = false;
    this.cdr.detectChanges();
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

  openAdd(): void {
    this.ensureLookupsLoaded();
    this.toggleDrawer('add');
  }

  openSearch(): void {
    this.ensureLookupsLoaded();
    this.toggleDrawer('search');
  }

  openEdit(): void {
    if (!this.isRowSelected) return;
    this.ensureLookupsLoaded();
    this.toggleDrawer('edit');
  }

  closeDrawer(): void {
    this.drawerEnd.close();
    this.drawerMode = null;
  }
  private initializeSearchDto(): void {
    const userData = this.userService.getUserDat?.();
    if (userData?.company) this.searchDto.code_company = userData.company;
  }

  private loadLookups(): void {
    this.measurementService.getAllMeasurements().subscribe({
      next: m => (this.measurements = m ?? []),
      error: err => console.error('Error medidas', err),
    });

    this.productTypeService.getAllProductTypes().subscribe({
      next: t => (this.productTypes = t ?? []),
      error: err => console.error('Error tipos', err),
    });
  }

  private ensureLookupsLoaded(): void {
    const hasMeasurements = Array.isArray(this.measurements) && this.measurements.length > 0;
    const hasProductTypes = Array.isArray(this.productTypes) && this.productTypes.length > 0;
    if (hasMeasurements && hasProductTypes) {
      return;
    }
    this.loadLookups();
  }

  loadProducts(criteria: ProductSearchDto): void {
    this.searchDto = criteria ?? {};
    this.loading = true;

    this.productService.getProductspag(this.searchDto, this.currentPage, this.itemsPerPage).subscribe({
      next: resp => {
        const mapped = (resp?.data ?? []).map((p: any) => ({
          id: p.id,
          productTypeId: Number(p.productTypeId ?? p.product_type?.id ?? 0),
          measurementId: Number(p.measurementId ?? p.measurement?.id ?? 0),
          code_Product: p.code_Product,
          name_Product: p.name_Product,
          description_Product: p.description_Product,
          price_Product: p.price_Product,
          stock_Product: p.stock_Product,
          barcode_Product: p.barcode_Product,
          name_ProductType: p.product_type?.name_ProductType ?? '',
          abbreviation_Measurement: p.measurement?.abbreviation_Measurement ?? '',
        }));

        this.applyGridData(mapped, resp?.meta?.total ?? mapped.length);
      },
      error: err => {
        console.error('Error productos', err);
        this.applyGridData([], 0);
      },
    });
  }

  onGridSelection(e: any): void {
    const row = this.extractSelectedRow(e);

    this.selectedRow = row;
    this.selectedProduct = row;
    this.isRowSelected = !!row;
    if (row) {
      console.log('Producto seleccionado:', row);
    }
  }

  onGridRowClick(e: any): void {
    this.onGridSelection(e);
  }

  private extractSelectedRow(e: any): Product | null {
    const firstSelected = e?.selected?.[0];
    const firstRow = e?.rows?.[0];
    const firstArray = Array.isArray(e) ? e[0] : null;

    const raw =
      e?.rowData ??
      e?.row?.data ??
      e?.row ??
      e?.record ??
      firstSelected?.data ??
      firstSelected ??
      firstRow?.data ??
      firstRow ??
      firstArray?.data ??
      firstArray ??
      e?.data ??
      null;

    if (!raw || typeof raw !== 'object') {
      return null;
    }

    return raw as Product;
  }

  onGridPageChange(e: any): void {
    if (this.suppressInitialPageEvent) return;
    if (this.loading) return;

    const pageIndex = Number(e?.pageIndex ?? 0);
    const pageSize = Number(e?.pageSize ?? this.itemsPerPage);

    this.currentPage = pageIndex + 1;
    this.itemsPerPage = pageSize;
    this.loadProducts(this.searchDto);
  }

  deleteSelected(): void {
    const p = this.selectedProduct;
    if (!p) return;

    const ok = confirm('¿Eliminar producto?');
    if (!ok) return;

    this.productService.deleteProduct(p.id).subscribe({
      next: () => {
        this.loadProducts(this.searchDto);
        this.selectedRow = null;
        this.selectedProduct = null;
        this.isRowSelected = false;
      },
      error: () => alert('Hubo un error al eliminar.'),
    });
  }

  createFromDrawer(dto: ProductCreateDto): void {
    this.loading = true;
    this.productService.addProduct(dto).subscribe({
      next: () => {
        this.closeDrawer();
        this.loadProducts(this.searchDto);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  updateFromDrawer(dto: ProductUpdateDto): void {
    const productId = this.selectedProduct?.id;
    if (!productId) {
      return;
    }

    this.loading = true;
    this.productService.updateProduct(productId, dto).subscribe({
      next: () => {
        this.closeDrawer();
        this.loadProducts(this.searchDto);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onSearch(dto: ProductSearchDto): void {
    this.currentPage = 1;
    this.loadProducts(dto);
    this.closeDrawer();
  }

  downloadExcel(): void {
    const headersMapping = {
      id: 'Id',
      code_Product: 'Código',
      name_Product: 'Descripcion',
      'product_type.name_ProductType': 'Tipo',
      'measurement.abbreviation_Measurement': 'Medida',
    };

    this.productService.getProducts(this.searchDto).subscribe({
      next: (response: any) => {
        const products = response?.data ?? [];
        this.excelExportService.exportToExcel(products, 'Productos', headersMapping);
      },
      error: err => console.error('Error excel', err),
    });
  }
}
