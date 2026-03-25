import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Menu, MenuUpdateDto } from 'src/app/models/menu';
import { MenuUpdatePayload, RecipeDraftItem } from 'src/app/models/recipe';
import { ProductService } from 'src/app/service/product.service';
import { RecipeService } from 'src/app/service/recipe.service';

@Component({
  selector: 'app-menu-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './menu-edit.html',
  styleUrls: ['../menu-add/menu-add.scss'],
})
export class MenuEditComponent implements OnChanges, OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly recipeService = inject(RecipeService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() menu: Menu | null = null;
  @Output() submitMenu = new EventEmitter<MenuUpdatePayload>();
  @Output() cancel = new EventEmitter<void>();
  products: any[] = [];
  selectedProductId = 0;
  recipeAmount = 0;
  selectedMeasurement = '';
  recipeItems: RecipeDraftItem[] = [];

  readonly form = this.fb.nonNullable.group({
    code_Menu: [0, [Validators.required, Validators.min(1)]],
    name_Menu: ['', [Validators.required, Validators.maxLength(120)]],
    description_Menu: ['', [Validators.maxLength(500)]],
    price_Menu: [0, [Validators.required, Validators.min(0)]],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['menu']) {
      this.patchFromMenu();
      this.loadRecipeDetails();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const dto: MenuUpdateDto = {
      code_Menu: Number(v.code_Menu) || 0,
      name_Menu: v.name_Menu.trim().toUpperCase(),
      description_Menu: (v.description_Menu ?? '').trim().toUpperCase(),
      price_Menu: Number(v.price_Menu) || 0,
    };

    const payload: MenuUpdatePayload = {
      menu: dto,
      recipes: this.recipeItems.map(item => ({
        id: item.id,
        productId: Number(item.productId) || 0,
        Amount_Recipe: Number(item.Amount_Recipe) || 0,
        productName: item.productName ?? '',
        productMeasurement: item.productMeasurement ?? '',
      })),
    };

    this.submitMenu.emit(payload);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private patchFromMenu(): void {
    const m = this.menu;
    if (!m) {
      return;
    }

    this.form.reset({
      code_Menu: Number(m.code_Menu) || 0,
      name_Menu: m.name_Menu ?? '',
      description_Menu: m.description_Menu ?? '',
      price_Menu: Number(m.price_Menu) || 0,
    });
  }

  onProductChange(): void {
    const selected = this.products.find(p => this.toNumber(p?.id ?? p?.Id) === this.selectedProductId);
    this.selectedMeasurement = this.resolveMeasurement(selected);
  }

  addRecipeItem(): void {
    if (this.selectedProductId <= 0 || this.recipeAmount <= 0) {
      return;
    }

    const selected = this.products.find(p => this.toNumber(p?.id ?? p?.Id) === this.selectedProductId);
    if (!selected) {
      return;
    }

    const exists = this.recipeItems.find(item => item.productId === this.selectedProductId);
    if (exists) {
      exists.Amount_Recipe = Number(exists.Amount_Recipe) + Number(this.recipeAmount);
      this.recipeAmount = 0;
      return;
    }

    this.recipeItems.push({
      productId: this.selectedProductId,
      Amount_Recipe: Number(this.recipeAmount),
      productName: this.resolveProductName(selected),
      productMeasurement: this.resolveMeasurement(selected),
    });

    this.recipeAmount = 0;
  }

  removeRecipeItem(index: number): void {
    if (index < 0 || index >= this.recipeItems.length) {
      return;
    }
    this.recipeItems.splice(index, 1);
  }

  private loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: products => {
        this.products = products ?? [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.products = [];
        this.cdr.detectChanges();
      },
    });
  }

  private loadRecipeDetails(): void {
    if (!this.menu?.id) {
      this.recipeItems = [];
      this.cdr.detectChanges();
      return;
    }

    this.recipeService.getRecipeDetails(this.menu.id).subscribe({
      next: details => {
        this.recipeItems = (details ?? []).map(d => ({
          id: this.toNumber((d as any).id ?? (d as any).Id),
          productId: this.toNumber((d as any).productId ?? (d as any).ProductId),
          Amount_Recipe: this.toNumber((d as any).Amount_Recipe ?? (d as any).amount_Recipe),
          productName: String((d as any).productName ?? (d as any).ProductName ?? ''),
          productMeasurement: String((d as any).productMeasurement ?? (d as any).ProductMeasurement ?? ''),
        }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.recipeItems = [];
        this.cdr.detectChanges();
      },
    });
  }

  private resolveProductName(raw: any): string {
    return String(raw?.name_Product ?? raw?.Name_Product ?? raw?.name_product ?? raw?.name ?? '');
  }

  private resolveMeasurement(raw: any): string {
    return String(
      raw?.abbreviation_Measurement ??
        raw?.measurement?.abbreviation_Measurement ??
        raw?.Measurement?.Abbreviation_Measurement ??
        ''
    );
  }

  private toNumber(value: unknown): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
}
