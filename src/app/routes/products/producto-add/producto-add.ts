import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { ProductCreateDto } from '../../../models/product';
import { Measurement } from '../../../models/measurement';
import { ProductType } from '../../../models/product-type';

@Component({
  selector: 'app-producto-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './producto-add.html',
  styleUrls: ['./producto-add.scss'],
})
export class ProductoAdd {
  private readonly fb = inject(FormBuilder);

  // Lookups vienen del padre (ProductComponent)
  @Input() productTypes: ProductType[] = [];
  @Input() measurements: Measurement[] = [];

  // El padre decide cómo guardar (service + refresh)
  @Output() submitProduct = new EventEmitter<ProductCreateDto>();
  @Output() cancel = new EventEmitter<void>();

  saving = false;

  // 👇 Mapea los campos reales de WNS (SKU, EAN, precio, stock, tipo, medida, etc.)
  readonly form = this.fb.nonNullable.group({
    productTypeId: [0, [Validators.required, Validators.min(1)]],
    measurementId: [0, [Validators.required, Validators.min(1)]],

    code_Product: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(/^[A-Z0-9\-_]+$/)]],
    barcode_Product: ['', [Validators.maxLength(30), Validators.pattern(/^[0-9]*$/)]], // EAN/UPC numérico (opcional)

    name_Product: ['', [Validators.required, Validators.maxLength(120)]],
    description_Product: ['', [Validators.maxLength(500)]],

    price_Product: [0, [Validators.required, Validators.min(0)]],
    stock_Product: [0, [Validators.required, Validators.min(0)]],
  });

  get f() { return this.form.controls; }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    // ✅ Regla del cliente: guardar texto en MAYÚSCULAS
    const dto: ProductCreateDto  = {
      productTypeId: v.productTypeId,
      measurementId: v.measurementId,

      code_Product: v.code_Product.trim().toUpperCase(),
      barcode_Product: (v.barcode_Product ?? '').trim(), // números; si quieres mayúsculas aquí no aplica

      name_Product: v.name_Product.trim().toUpperCase(),
      description_Product: (v.description_Product ?? '').trim().toUpperCase(),

      price_Product: Number(v.price_Product) || 0,
      stock_Product: Number(v.stock_Product) || 0,
    };

    this.submitProduct.emit(dto);
  }

  onCancel() {
    this.cancel.emit();
  }

  reset() {
    this.form.reset({
      productTypeId: 0,
      measurementId: 0,
      code_Product: '',
      barcode_Product: '',
      name_Product: '',
      description_Product: '',
      price_Product: 0,
      stock_Product: 0,
    });
  }
}
