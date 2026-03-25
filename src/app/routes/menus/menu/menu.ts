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
import { firstValueFrom } from 'rxjs';
import { Menu, MenuCreateDto, MenuSearchDto, MenuUpdateDto } from 'src/app/models/menu';
import { MenuCreatePayload, MenuUpdatePayload, RecipeDetailDto, RecipeDto } from 'src/app/models/recipe';
import { MenuCrudService } from 'src/app/service/menu.service';
import { RecipeService } from 'src/app/service/recipe.service';
import { ExcelExportService } from 'src/app/utilities/excel-export.service';
import { MenuAddComponent } from '../menu-add/menu-add';
import { MenuEditComponent } from '../menu-edit/menu-edit';
import { MenuSearchComponent } from '../menu-search/menu-search';

type DrawerMode = 'add' | 'search' | 'edit' | null;

@Component({
  selector: 'app-menu',
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
    MenuAddComponent,
    MenuEditComponent,
    MenuSearchComponent,
    MtxGridModule,
  ],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class MenuComponent implements OnInit {
  @ViewChild('drawerEnd', { static: true }) drawerEnd!: MatDrawer;
  drawerMode: DrawerMode = null;
  gridReady = false;
  private suppressInitialPageEvent = true;

  loading = false;
  trackById = (_: number, item: any) => item?.id;

  columns: MtxGridColumn[] = [
    { header: 'Código', field: 'code_Menu', minWidth: 70 },
    { header: 'Nombre', field: 'name_Menu', minWidth: 100 },
    { header: 'Descripción', field: 'description_Menu', minWidth: 140 },
    { header: 'Precio', field: 'price_Menu', minWidth: 70 },
  ];

  rows: Menu[] = [];
  private allMenus: Menu[] = [];
  searchDto: MenuSearchDto = {};
  currentPage = 1;
  itemsPerPage = 25;
  totalItems = 0;

  selectedRow: Menu | null = null;
  selectedMenu: Menu | null = null;
  isRowSelected = false;

  constructor(
    private readonly menuService: MenuCrudService,
    private readonly recipeService: RecipeService,
    private readonly excelExportService: ExcelExportService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.gridReady = true;
    this.suppressInitialPageEvent = false;
    this.loadMenus();
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

    const menuId = this.selectedMenu?.id ?? this.selectedRow?.id;
    this.selectedMenu = this.selectedRow ? { ...this.selectedRow } : this.selectedMenu ? { ...this.selectedMenu } : null;
    this.cdr.detectChanges();
    this.toggleDrawer('edit');

    if (!menuId) return;

    this.menuService.getMenuById(menuId).subscribe({
      next: menu => {
        const mapped = this.toMenuModel(menu);
        if (mapped.id > 0) {
          this.selectedMenu = mapped;
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

  loadMenus(): void {
    this.loading = true;
    this.menuService.getAllMenus().subscribe({
      next: menus => {
        this.allMenus = (menus ?? []).map(m => ({
          id: Number((m as any).id ?? (m as any).Id ?? 0),
          code_Menu: Number((m as any).code_Menu ?? (m as any).Code_Menu ?? 0),
          name_Menu: String((m as any).name_Menu ?? (m as any).Name_Menu ?? ''),
          description_Menu: String((m as any).description_Menu ?? (m as any).Description_Menu ?? ''),
          price_Menu: Number((m as any).price_Menu ?? (m as any).Price_Menu ?? 0),
        }));
        this.applyFiltersAndPaging();
      },
      error: err => {
        console.error('Error menús', err);
        this.allMenus = [];
        this.applyGridData([], 0);
      },
    });
  }

  private applyFiltersAndPaging(): void {
    const filtered = this.allMenus.filter(menu => this.matchesSearch(menu, this.searchDto));
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.applyGridData(filtered.slice(start, end), filtered.length);
  }

  private matchesSearch(menu: Menu, dto: MenuSearchDto): boolean {
    if (!dto) return true;

    const byCode = dto.code_Menu ? menu.code_Menu === dto.code_Menu : true;
    const byName = dto.name_Menu ? menu.name_Menu.toLowerCase().includes(dto.name_Menu.toLowerCase()) : true;
    const byDescription = dto.description_Menu
      ? menu.description_Menu.toLowerCase().includes(dto.description_Menu.toLowerCase())
      : true;
    const byPrice = dto.price_Menu !== undefined ? Number(menu.price_Menu) === Number(dto.price_Menu) : true;

    return byCode && byName && byDescription && byPrice;
  }

  private applyGridData(mapped: Menu[], total: number): void {
    this.selectedRow = null;
    this.selectedMenu = null;
    this.isRowSelected = false;
    this.rows = [...mapped];
    this.totalItems = total;
    this.loading = false;
    this.cdr.detectChanges();
  }

  onGridSelection(e: any): void {
    const raw = e?.row ?? e?.record ?? e?.rows?.[0] ?? e?.selected?.[0] ?? (Array.isArray(e) ? e[0] : null) ?? null;
    const row = this.toMenuModel(raw);
    if (!row || row.id <= 0) {
      return;
    }

    this.selectedRow = row;
    this.selectedMenu = row;
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
    const m = this.selectedMenu;
    if (!m) return;

    const ok = confirm('¿Eliminar menú?');
    if (!ok) return;

    this.menuService.deleteMenu(m.id).subscribe({
      next: () => {
        this.loadMenus();
      },
      error: () => alert('Hubo un error al eliminar.'),
    });
  }

  createFromDrawer(payload: MenuCreatePayload): void {
    this.loading = true;
    this.menuService.addMenu(payload.menu as MenuCreateDto).subscribe({
      next: res => {
        const createdMenuId = this.extractIdFromCreateResponse(res);
        if (!createdMenuId || payload.recipes.length === 0) {
          this.closeDrawer();
          this.loadMenus();
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        this.createRecipes(createdMenuId, payload.recipes)
          .then(() => {
            this.closeDrawer();
            this.loadMenus();
            this.loading = false;
            this.cdr.detectChanges();
          })
          .catch(() => {
            this.loading = false;
            this.cdr.detectChanges();
          });
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  updateFromDrawer(payload: MenuUpdatePayload): void {
    const menuId = this.selectedMenu?.id;
    if (!menuId) {
      return;
    }

    this.loading = true;
    this.menuService.updateMenu(menuId, payload.menu as MenuUpdateDto).subscribe({
      next: () => {
        this.syncRecipes(menuId, payload.recipes)
          .then(() => {
            this.closeDrawer();
            this.loadMenus();
            this.loading = false;
            this.cdr.detectChanges();
          })
          .catch(() => {
            this.loading = false;
            this.cdr.detectChanges();
          });
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSearch(dto: MenuSearchDto): void {
    this.currentPage = 1;
    this.searchDto = dto ?? {};
    this.applyFiltersAndPaging();
    this.closeDrawer();
  }

  downloadExcel(): void {
    const headersMapping = {
      id: 'Id',
      code_Menu: 'Código',
      name_Menu: 'Nombre',
      description_Menu: 'Descripción',
      price_Menu: 'Precio',
    };

    const filtered = this.allMenus.filter(menu => this.matchesSearch(menu, this.searchDto));
    this.excelExportService.exportToExcel(filtered, 'Menus', headersMapping);
  }

  private async createRecipes(menuId: number, recipes: MenuCreatePayload['recipes']): Promise<void> {
    for (const item of recipes) {
      const dto: RecipeDto = {
        id: 0,
        menuId,
        productId: Number(item.productId) || 0,
        Amount_Recipe: Number(item.Amount_Recipe) || 0,
      };
      await firstValueFrom(this.recipeService.addRecipe(dto));
    }
  }

  private async syncRecipes(menuId: number, recipes: MenuUpdatePayload['recipes']): Promise<void> {
    const existing = await firstValueFrom(this.recipeService.getRecipeDetails(menuId));
    const currentDetails = (existing ?? []) as RecipeDetailDto[];

    const incomingIds = new Set(recipes.map(item => Number(item.id || 0)).filter(id => id > 0));

    for (const oldItem of currentDetails) {
      const oldId = Number((oldItem as any).id ?? (oldItem as any).Id ?? 0);
      if (oldId > 0 && !incomingIds.has(oldId)) {
        await firstValueFrom(this.recipeService.deleteRecipe(oldId));
      }
    }

    for (const item of recipes) {
      const dto: RecipeDto = {
        id: Number(item.id || 0),
        menuId,
        productId: Number(item.productId) || 0,
        Amount_Recipe: Number(item.Amount_Recipe) || 0,
      };

      if (dto.id > 0) {
        await firstValueFrom(this.recipeService.updateRecipe(dto.id, dto));
      } else {
        await firstValueFrom(this.recipeService.addRecipe({ ...dto, id: 0 }));
      }
    }
  }

  private extractIdFromCreateResponse(res: any): number {
    const maybeId = Number(res?.id ?? res?.Id ?? res);
    return Number.isFinite(maybeId) ? maybeId : 0;
  }

  private toMenuModel(raw: any): Menu {
    const source = raw?.data ?? raw;
    return {
      id: Number(source?.id ?? source?.Id ?? 0),
      code_Menu: Number(source?.code_Menu ?? source?.Code_Menu ?? 0),
      name_Menu: String(source?.name_Menu ?? source?.Name_Menu ?? ''),
      description_Menu: String(source?.description_Menu ?? source?.Description_Menu ?? ''),
      price_Menu: Number(source?.price_Menu ?? source?.Price_Menu ?? 0),
    };
  }
}
