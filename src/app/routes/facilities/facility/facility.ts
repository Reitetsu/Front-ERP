import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MtxGridColumn, MtxGridModule } from '@ng-matero/extensions/grid';
import { Facility, FacilityCreateDto, FacilitySearchDto, FacilityUpdateDto } from 'src/app/models/facility';
import { CompanyService } from 'src/app/service/company.service';
import { FacilityService } from 'src/app/service/facility.service';
import { ExcelExportService } from 'src/app/utilities/excel-export.service';
import { FacilityAddComponent } from '../facility-add/facility-add';
import { FacilityEditComponent } from '../facility-edit/facility-edit';
import { FacilitySearchComponent } from '../facility-search/facility-search';

type DrawerMode = 'add' | 'search' | 'edit' | null;

@Component({
  selector: 'app-facility',
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
    FacilityAddComponent,
    FacilityEditComponent,
    FacilitySearchComponent,
    MtxGridModule,
  ],
  templateUrl: './facility.html',
  styleUrl: './facility.scss',
})
export class FacilityComponent implements OnInit {
  @ViewChild('drawerEnd', { static: true }) drawerEnd!: MatDrawer;
  drawerMode: DrawerMode = null;
  gridReady = false;
  private suppressInitialPageEvent = true;

  loading = false;
  trackById = (_: number, item: any) => item?.id;

  columns: MtxGridColumn[] = [
    { header: 'Codigo', field: 'code_Facility', minWidth: 90 },
    { header: 'Nombre', field: 'name_Facility', minWidth: 120 },
    { header: 'Descripcion', field: 'description_Facility', minWidth: 140 },
    { header: 'Direccion', field: 'address_Facility', minWidth: 150 },
    { header: 'Contacto', field: 'contact_Facility', minWidth: 120 },
    { header: 'Email', field: 'email_Facility', minWidth: 140 },
    { header: 'Telefono', field: 'phone_Facility', minWidth: 100 },
    { header: 'Tipo', field: 'facilityTypeId', minWidth: 70, resizable: false },
  ];

  rows: Facility[] = [];
  private allFacilities: Facility[] = [];
  searchDto: FacilitySearchDto = {};
  currentPage = 1;
  itemsPerPage = 25;
  totalItems = 0;

  selectedRow: Facility | null = null;
  selectedFacility: Facility | null = null;
  isRowSelected = false;

  constructor(
    private readonly facilityService: FacilityService,
    private readonly companyService: CompanyService,
    private readonly excelExportService: ExcelExportService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.gridReady = true;
    this.suppressInitialPageEvent = false;
    this.loadFacilities();
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
    this.toggleDrawer('add');
  }

  openSearch(): void {
    this.toggleDrawer('search');
  }

  openEdit(): void {
    if (!this.isRowSelected) return;

    const facilityId = this.selectedFacility?.id ?? this.selectedRow?.id;
    this.selectedFacility = this.selectedRow
      ? { ...this.selectedRow }
      : this.selectedFacility
        ? { ...this.selectedFacility }
        : null;
    this.cdr.detectChanges();
    this.toggleDrawer('edit');

    if (!facilityId) return;

    this.facilityService.getFacilityById(facilityId).subscribe({
      next: facility => {
        const mapped = this.toFacility(facility);
        if (mapped.id > 0) {
          this.selectedFacility = mapped;
          this.cdr.detectChanges();
        }
      },
      error: () => {},
    });
  }

  closeDrawer(): void {
    this.drawerEnd.close();
    this.drawerMode = null;
  }

  loadFacilities(): void {
    this.loading = true;
    this.facilityService.getAllFacilities().subscribe({
      next: facilities => {
        this.allFacilities = (facilities ?? []).map(f => this.toFacility(f));
        this.applyFiltersAndPaging();
      },
      error: err => {
        console.error('Error facilities', err);
        this.allFacilities = [];
        this.applyGridData([], 0);
      },
    });
  }

  private applyFiltersAndPaging(): void {
    const filtered = this.allFacilities.filter(facility => this.matchesSearch(facility, this.searchDto));
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.applyGridData(filtered.slice(start, end), filtered.length);
  }

  private matchesSearch(facility: Facility, dto: FacilitySearchDto): boolean {
    if (!dto) return true;

    const byCode = dto.code_Facility
      ? facility.code_Facility.toLowerCase().includes(dto.code_Facility.toLowerCase())
      : true;
    const byName = dto.name_Facility
      ? facility.name_Facility.toLowerCase().includes(dto.name_Facility.toLowerCase())
      : true;
    const byDescription = dto.description_Facility
      ? facility.description_Facility.toLowerCase().includes(dto.description_Facility.toLowerCase())
      : true;
    const byAddress = dto.address_Facility
      ? facility.address_Facility.toLowerCase().includes(dto.address_Facility.toLowerCase())
      : true;
    const byContact = dto.contact_Facility
      ? facility.contact_Facility.toLowerCase().includes(dto.contact_Facility.toLowerCase())
      : true;
    const byEmail = dto.email_Facility
      ? facility.email_Facility.toLowerCase().includes(dto.email_Facility.toLowerCase())
      : true;
    const byPhone = dto.phone_Facility
      ? facility.phone_Facility.toLowerCase().includes(dto.phone_Facility.toLowerCase())
      : true;
    const byType = dto.facilityTypeId !== undefined ? Number(facility.facilityTypeId) === Number(dto.facilityTypeId) : true;

    return byCode && byName && byDescription && byAddress && byContact && byEmail && byPhone && byType;
  }

  private applyGridData(mapped: Facility[], total: number): void {
    this.selectedRow = null;
    this.selectedFacility = null;
    this.isRowSelected = false;
    this.rows = [...mapped];
    this.totalItems = total;
    this.loading = false;
    this.cdr.detectChanges();
  }

  onGridSelection(e: any): void {
    const raw = e?.row ?? e?.record ?? e?.rows?.[0] ?? e?.selected?.[0] ?? (Array.isArray(e) ? e[0] : null) ?? null;
    const row = this.toFacility(raw);
    if (!row || row.id <= 0) {
      return;
    }

    this.selectedRow = row;
    this.selectedFacility = row;
    this.isRowSelected = true;
  }

  onGridRowClick(e: any): void {
    const row = e?.row ?? e?.record ?? e ?? null;
    this.onGridSelection({ row });
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

  deleteSelected(): void {
    const facility = this.selectedFacility;
    if (!facility) return;

    const ok = confirm('Eliminar facility?');
    if (!ok) return;

    this.facilityService.deleteFacility(facility.id).subscribe({
      next: () => {
        this.loadFacilities();
      },
      error: () => alert('Hubo un error al eliminar.'),
    });
  }

  async createFromDrawer(dto: FacilityCreateDto): Promise<void> {
    const companyId = (await this.companyService.obtenerCompany()) ?? 1;
    const payload: FacilityCreateDto = {
      ...dto,
      companyId: Number(companyId) || 1,
    };

    this.loading = true;
    this.facilityService.addFacility(payload).subscribe({
      next: () => {
        this.closeDrawer();
        this.loadFacilities();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  updateFromDrawer(dto: FacilityUpdateDto): void {
    const facilityId = this.selectedFacility?.id;
    if (!facilityId) {
      return;
    }

    this.loading = true;
    this.facilityService.updateFacility(facilityId, dto).subscribe({
      next: () => {
        this.closeDrawer();
        this.loadFacilities();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSearch(dto: FacilitySearchDto): void {
    this.currentPage = 1;
    this.searchDto = dto ?? {};
    this.applyFiltersAndPaging();
    this.closeDrawer();
  }

  downloadExcel(): void {
    const headersMapping = {
      id: 'Id',
      code_Facility: 'Codigo',
      name_Facility: 'Nombre',
      description_Facility: 'Descripcion',
      address_Facility: 'Direccion',
      contact_Facility: 'Contacto',
      email_Facility: 'Email',
      phone_Facility: 'Telefono',
      facilityTypeId: 'Tipo',
    };

    const filtered = this.allFacilities.filter(facility => this.matchesSearch(facility, this.searchDto));
    this.excelExportService.exportToExcel(filtered, 'Facilities', headersMapping);
  }

  private toFacility(raw: any): Facility {
    const source = raw?.data ?? raw;
    return {
      id: Number(source?.id ?? source?.Id ?? 0),
      code_Facility: String(source?.code_Facility ?? source?.Code_Facility ?? source?.code_facility ?? ''),
      name_Facility: String(source?.name_Facility ?? source?.Name_Facility ?? source?.name_facility ?? ''),
      description_Facility: String(
        source?.description_Facility ?? source?.Description_Facility ?? source?.description_facility ?? ''
      ),
      address_Facility: String(source?.address_Facility ?? source?.Address_Facility ?? source?.address_facility ?? ''),
      contact_Facility: String(source?.contact_Facility ?? source?.Contact_Facility ?? source?.contact_facility ?? ''),
      email_Facility: String(source?.email_Facility ?? source?.Email_Facility ?? source?.email_facility ?? ''),
      phone_Facility: String(source?.phone_Facility ?? source?.Phone_Facility ?? source?.phone_facility ?? ''),
      facilityTypeId: Number(source?.facilityTypeId ?? source?.FacilityTypeId ?? source?.facility_type_id ?? 0),
      createdAt: source?.createdAt ?? source?.CreatedAt ?? source?.created_at,
      updatedAt: source?.updatedAt ?? source?.UpdatedAt ?? source?.updated_at,
    };
  }
}
