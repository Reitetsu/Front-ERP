import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';

import { Product, ProductSearchDto } from 'src/app/models/product'; // ajusta alias si no lo tienes
import { Measurement } from 'src/app/models/measurement';

import { ProductService } from 'src/app/service/product.service';
import { MeasurementService } from 'src/app/service/measurement.service';
import { ProductTypeService } from 'src/app/service/product-type.service';
import { UserService } from 'src/app/service/user.service';

import { ExcelExportService } from 'src/app/utilities/excel-export.service';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

import { MatTableDataSource } from '@angular/material/table';


interface ProductType {
  id: number;
  name_ProductType: string;
}

interface Field {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  options?: { value: any; label: any }[];
}

export interface SearchField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  options?: any[];
}

export interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSidenavModule,

    MatTableModule,
    MatPaginatorModule,
    MatSortModule,

  ],
  templateUrl: './product.html',
  styleUrl: './product.scss',
})
export class ProductComponent implements OnInit {
  // ===== UI refs =====

  @ViewChild('drawerSearch', { static: true }) drawerSearch!: MatDrawer;
  @ViewChild('drawerAdd', { static: true }) drawerAdd!: MatDrawer;
  @ViewChild('drawerEdit', { static: true }) drawerEdit!: MatDrawer;

  @ViewChild('tableContainer', { static: false }) tableContainer!: ElementRef;
  dataSource = new MatTableDataSource<any>([]);

  // ===== State =====
  searchDto: ProductSearchDto = {};
  currentPage = 1;
  itemsPerPage = 25;
  totalItems = 0;

  isRowSelected = false;
  selectedProduct: Product | null = null;
  selectedRow: Product | null = null;

  products: Product[] = [];
  data: any[] = [];
  columns: any[] = [];

  measurements: Measurement[] = [];
  productTypes: ProductType[] = [];

  displayedColumns: string[] = [
  'barcode_Product',
  'code_Product',
  'name_Product',
  'name_ProductType',
  'abbreviation_Measurement',
  'price_Product',
  'stock_Product',
];

  // ===== Reusable IU fields =====
  fieldsAdd: Field[] = [
    { name: 'code_Product', label: 'Sku', type: 'text', placeholder: 'Ingrese el SKU' },
    { name: 'barcode_Product', label: 'EAN', type: 'text', placeholder: 'Ingrese el Barcode' },
    { name: 'name_Product', label: 'Nombre', type: 'text', placeholder: 'Nombre del producto' },
    { name: 'measurementId', label: 'Medida', type: 'select', options: [] },
    { name: 'productTypeId', label: 'Tipo', type: 'select', options: [] },
    { name: 'price_Product', label: 'Precio', type: 'number', placeholder: 'Precio del producto' },
    { name: 'stock_Product', label: 'Stock', type: 'number', placeholder: 'Stock del producto' },
  ];

  buttons = [
    { label: 'Agregar', action: 'add' },
    { label: 'Nuevo', action: 'new' },
    { label: 'Cerrar', action: 'close' },
  ];

  fieldsSearch: SearchField[] = [
    { name: 'code_Product', label: 'Sku', type: 'text', placeholder: 'Ingrese el SKU' },
    { name: 'barcode_Product', label: 'EAN', type: 'text', placeholder: 'Ingrese el Barcode' },
    { name: 'name_Product', label: 'Nombre', type: 'text', placeholder: 'Nombre del producto' },
    { name: 'measurementId', label: 'Medida', type: 'select', options: [] },
    { name: 'productTypeId', label: 'Tipo', type: 'select', options: [] },
  ];

  buttonsSearch = [
    { label: 'Buscar', action: 'search' },
    { label: 'Resetear', action: 'reset' },
    { label: 'Cerrar', action: 'close' },
  ];

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private measurementService: MeasurementService,
    private productTypeService: ProductTypeService,
    private excelExportService: ExcelExportService
  ) {}

  // ===== Lifecycle =====
  ngOnInit(): void {
    this.initializeSearchDto();
    this.initializeColumns();

    this.loadLookups();
    this.loadProducts(this.searchDto);
  }

  // ===== Init =====
  private initializeColumns(): void {
    this.columns = [
      { header: 'ID', field: 'id', width: '50px', hidden: true },
      { header: 'EAN', field: 'barcode_Product', width: '120px' },
      { header: 'Sku', field: 'code_Product', width: '100px' },
      { header: 'Descripción', field: 'name_Product', width: '450px' },
      { header: 'Tipo', field: 'name_ProductType', width: '120px' },
      { header: 'Medida', field: 'abbreviation_Measurement', width: '90px' },
      { header: 'Precio', field: 'price_Product', width: '90px', type: 'currency' },
      { header: 'Stock', field: 'stock_Product', width: '90px' },
    ];
  }

  private initializeSearchDto(): void {
    const userData = this.userService.getUserDat?.();
    if (userData?.company) this.searchDto.code_company = userData.company;
  }

  private loadLookups(): void {
    this.loadMeasurements();
    this.loadProductTypes();
  }

  // ===== Lookups =====
  private loadMeasurements(): void {
    this.measurementService.getAllMeasurements().subscribe({
      next: (measurements) => {
        this.measurements = measurements;

        const opts: SelectOption[] = measurements.map(m => ({
          value: m.id,
          label: m.abbreviation_Measurement,
        }));

        this.setSelectOptions(this.fieldsAdd, 'measurementId', opts);
        this.setSelectOptions(this.fieldsSearch, 'measurementId', opts);
      },
      error: (err) => console.error('Error al cargar medidas', err),
    });
  }

  private loadProductTypes(): void {
    this.productTypeService.getAllProductTypes().subscribe({
      next: (types) => {
        this.productTypes = types;

        const opts: SelectOption[] = types.map(t => ({
          value: t.id,
          label: t.name_ProductType,
        }));

        this.setSelectOptions(this.fieldsAdd, 'productTypeId', opts);
        this.setSelectOptions(this.fieldsSearch, 'productTypeId', opts);
      },
      error: (err) => console.error('Error al cargar tipos de producto', err),
    });
  }

  private setSelectOptions(fields: any[], name: string, options: SelectOption[]): void {
    const f = fields.find(x => x.name === name);
    if (f) f.options = options;
  }

  // ===== Data =====
  loadProducts(criteria: any): void {
    this.searchDto = criteria ?? {};
    const page = this.currentPage || 1;
    const perPage = this.itemsPerPage || 25;

    this.productService.getProductspag(this.searchDto, page, perPage).subscribe({
      next: (resp) => {
        const mapped = resp.data.map((p: any) => ({
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

        this.products = mapped;
        this.data = mapped;

        this.totalItems = resp.meta.total;
        this.currentPage = resp.meta.current_page;
        this.itemsPerPage = resp.meta.per_page;
      },
      error: (err) => console.error('Error al cargar productos', err),
    });
  }

  // ===== Table selection =====
  selectProduct(row: Product): void {
    this.selectedRow = row;
    this.selectedProduct = row;
    this.isRowSelected = true;
  }

  clearSelection(): void {
    this.selectedRow = null;
    this.selectedProduct = null;
    this.isRowSelected = false;
  }

  // ===== Drawer actions (Matero style) =====
  openAdd(): void {
    this.drawerSearch.close();
    this.drawerEdit.close();
    this.drawerAdd.toggle();
  }

  openSearch(): void {
    this.drawerAdd.close();
    this.drawerEdit.close();
    this.drawerSearch.toggle();
  }

  openEdit(): void {
    if (!this.isRowSelected) return;
    this.drawerAdd.close();
    this.drawerSearch.close();
    this.drawerEdit.toggle();
  }

  closeAllDrawers(): void {
    this.drawerAdd.close();
    this.drawerSearch.close();
    this.drawerEdit.close();
  }

  // ===== Reusable IU events =====
  handleAction(event: { action: string; data: any }): void {
    switch (event.action) {
      case 'add':
        this.addProduct(event.data);
        break;
      case 'new':
        this.addProduct(event.data);
        break;
      case 'close':
        this.closeAllDrawers();
        break;
      default:
        console.log('Acción desconocida:', event.action);
    }
  }

  handleSearch(criteria: any): void {
    this.searchDto = criteria ?? {};
    this.currentPage = 1;
    this.loadProducts(this.searchDto);
  }



  // ===== CRUD =====
  addProduct(data: any): void {
    // si tu backend necesita company_id fijo, lo mantenemos
    data.company_id = 1;

    this.productService.addProduct(data).subscribe({
      next: (response) => {
        if (response?.success) {
          this.loadProducts(this.searchDto);
        } else {
          alert(response?.message ?? 'No se pudo agregar el producto.');
        }
      },
      error: (error) => alert('Error al agregar el producto: ' + (error?.message ?? error)),
    });
  }

  deleteSelected(): void {
    const p = this.selectedProduct;
    if (!p) return;

    const confirmed = confirm('¿Estás seguro de que deseas eliminar este producto?');
    if (!confirmed) return;

    this.productService.deleteProduct(p.id).subscribe({
      next: () => {
        this.loadProducts(this.searchDto);
        this.clearSelection();
        alert('Producto eliminado correctamente.');
      },
      error: () => alert('Hubo un error al eliminar el producto.'),
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
        const products = response.data ?? [];
        this.excelExportService.exportToExcel(products, 'Productos', headersMapping);
      },
      error: (err) => console.error('Error al obtener todos los productos:', err),
    });
  }

  // ===== Pagination =====
  goToPage(page: number): void {
    this.currentPage = page;
    this.loadProducts(this.searchDto);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
}
