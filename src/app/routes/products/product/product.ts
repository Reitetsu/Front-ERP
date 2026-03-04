import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { Product, ProductSearchDto,ProductCreateDto } from 'src/app/models/product'; // ajusta alias si no lo tienes
import { Measurement } from 'src/app/models/measurement';

import { ProductService } from 'src/app/service/product.service';
import { MeasurementService } from 'src/app/service/measurement.service';
import { ProductTypeService } from 'src/app/service/product-type.service';
import { UserService } from 'src/app/service/user.service';

import { ExcelExportService } from 'src/app/utilities/excel-export.service';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { MatTableDataSource } from '@angular/material/table';
import { ProductoAdd } from '../producto-add/producto-add';
import { ProductType } from 'src/app/models/product-type';
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

    // drawer content
    ProductoAdd,
    MtxGridModule,
  ],
  templateUrl: './product.html',
  styleUrl: './product.scss',
})
export class ProductComponent implements OnInit {
   // ===== Drawer único =====
  @ViewChild('drawerEnd', { static: true }) drawerEnd!: MatDrawer;
  drawerMode: DrawerMode = null;

  // ===== Grid =====
  private gridReady = false;
  loading = false;
  trackById = (_: number, item: any) => item?.id;
  columns: MtxGridColumn[] = [
    { header: 'EAN', field: 'barcode_Product', minWidth: 50 },
    { header: 'SKU', field: 'code_Product', minWidth: 50 },
    { header: 'Descripción', field: 'name_Product', minWidth: 50 },
    { header: 'Tipo', field: 'name_ProductType', minWidth: 50 },
    { header: 'Medida', field: 'abbreviation_Measurement', minWidth: 50 },
    { header: 'Precio', field: 'price_Product', minWidth: 50 },
    { header: 'Stock', field: 'stock_Product', minWidth: 50, resizable: false }, // ejemplo
  ];

  rows: Product[] = [];

  // ===== Paging server-side =====
  searchDto: ProductSearchDto = {};
  currentPage = 1;
  itemsPerPage = 25;
  totalItems = 0;

  // ===== Selection =====
  selectedRow: Product | null = null;
  selectedProduct: Product | null = null;
  isRowSelected = false;

  // ===== Lookups =====
  measurements: Measurement[] = [];
  productTypes: ProductType[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private productService: ProductService,
    private userService: UserService,
    private measurementService: MeasurementService,
    private productTypeService: ProductTypeService,
    private excelExportService: ExcelExportService
  ) {}

  ngOnInit(): void {
    this.initializeSearchDto();
    this.loadLookups();
    this.loadProducts(this.searchDto);
    queueMicrotask(() => (this.gridReady = true));
  }

  // ===== Drawer =====
  openAdd(): void {
    this.drawerMode = 'add';
    this.drawerEnd.open();
  }

  openSearch(): void {
    this.drawerMode = 'search';
    this.drawerEnd.open();
  }

  openEdit(): void {
    if (!this.isRowSelected) return;
    this.drawerMode = 'edit';
    this.drawerEnd.open();
  }

  closeDrawer(): void {
    this.drawerEnd.close();
    this.drawerMode = null;
  }

  // ===== Init =====
  private initializeSearchDto(): void {
    const userData = this.userService.getUserDat?.();
    if (userData?.company) this.searchDto.code_company = userData.company;
  }

  private loadLookups(): void {
    this.measurementService.getAllMeasurements().subscribe({
      next: (m) => (this.measurements = m),
      error: (err) => console.error('Error medidas', err),
    });

    this.productTypeService.getAllProductTypes().subscribe({
      next: (t) => (this.productTypes = t),
      error: (err) => console.error('Error tipos', err),
    });
  }

  // ===== Data =====
  loadProducts(criteria: any): void {
    this.searchDto = criteria ?? {};
    this.loading = true;

    this.productService.getProductspag(this.searchDto, this.currentPage, this.itemsPerPage).subscribe({
      next: (resp) => {
        const mapped = (resp?.data ?? []).map((p: any) => ({
          id: p.id,
          code_Product: p.code_Product,
          name_Product: p.name_Product,
          description_Product: p.description_Product,
          price_Product: p.price_Product,
          stock_Product: p.stock_Product,
          barcode_Product: p.barcode_Product,
          name_ProductType: p.product_type?.name_ProductType ?? '',
          abbreviation_Measurement: p.measurement?.abbreviation_Measurement ?? '',
        }));

        this.selectedRow = null;
        this.selectedProduct = null;
        this.isRowSelected = false;
        this.rows = [...mapped];
        this.totalItems = resp?.meta?.total ?? mapped.length;


        this.loading = false;

        // ✅ evita NG0100
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error productos', err);
        this.loading = false;
      },
    });
  }

  // ===== Grid events =====
  onGridSelection(e: any): void {
    const row =
      e?.row ??
      e?.rows?.[0] ??
      e?.selected?.[0] ??
      (Array.isArray(e) ? e[0] : null) ??
      null;

    queueMicrotask(() => {
      this.selectedRow = row;
      this.selectedProduct = row;
      this.isRowSelected = !!row;
      this.cdr.detectChanges();
    });
  }

  onGridPageChange(e: any): void {
    if (this.loading) return;

    const pageIndex = Number(e?.pageIndex ?? 0);
    const pageSize = Number(e?.pageSize ?? this.itemsPerPage);

    this.currentPage = pageIndex + 1;
    this.itemsPerPage = pageSize;

    this.loadProducts(this.searchDto);
  }

  // ===== Delete =====
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
  createFromDrawer(dto: ProductCreateDto) {
    // Si tu backend exige campos extra (company_id, etc.) este es el sitio correcto para setearlos.

    this.loading = true; // si ya usas bandera de loading
    this.productService.addProduct(dto).subscribe({
      next: () => {
        this.closeDrawer();
        // refresca el grid con el search actual:
        this.loadProducts(this.searchDto);
        this.loading = false;
        // opcional: snackbar (si ya tienes MatSnackBar en el padre)
      },
      error: () => {
        this.loading = false;
        // opcional: snackbar error
      }
    });
  }
  // ===== Excel =====
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
      error: (err) => console.error('Error excel', err),
    });
  }
}
