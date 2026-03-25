import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Measurement } from '../../../models/measurement';
import { Product, ProductUpdateDto } from '../../../models/product';
import { ProductType } from '../../../models/product-type';

@Component({
  selector: 'app-producto-edit',
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
  templateUrl: './producto-edit.html',
  styleUrls: ['../producto-add/producto-add.scss'],
})
export class ProductoEdit implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() product: Product | null = null;
  @Input() productTypes: ProductType[] = [];
  @Input() measurements: Measurement[] = [];

  @Output() submitProduct = new EventEmitter<ProductUpdateDto>();
  @Output() cancel = new EventEmitter<void>();

  readonly form = this.fb.nonNullable.group({
    productTypeId: [0, [Validators.required, Validators.min(1)]],
    measurementId: [0, [Validators.required, Validators.min(1)]],
    code_Product: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(/^[A-Z0-9\-_]+$/)]],
    barcode_Product: ['', [Validators.maxLength(30), Validators.pattern(/^[0-9]*$/)]],
    name_Product: ['', [Validators.required, Validators.maxLength(120)]],
    description_Product: ['', [Validators.maxLength(500)]],
    price_Product: [0, [Validators.required, Validators.min(0)]],
    stock_Product: [0, [Validators.required, Validators.min(0)]],
  });

  get f() {
    return this.form.controls;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.patchFromProduct();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const dto: ProductUpdateDto = {
      productTypeId: v.productTypeId,
      measurementId: v.measurementId,
      code_Product: v.code_Product.trim().toUpperCase(),
      barcode_Product: (v.barcode_Product ?? '').trim(),
      name_Product: v.name_Product.trim().toUpperCase(),
      description_Product: (v.description_Product ?? '').trim().toUpperCase(),
      price_Product: Number(v.price_Product) || 0,
      stock_Product: Number(v.stock_Product) || 0,
    };

    this.submitProduct.emit(dto);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private patchFromProduct(): void {
    const p = this.product;
    if (!p) {
      return;
    }

    this.form.reset({
      productTypeId: p.productTypeId ?? 0,
      measurementId: p.measurementId ?? 0,
      code_Product: p.code_Product ?? '',
      barcode_Product: p.barcode_Product ?? '',
      name_Product: p.name_Product ?? '',
      description_Product: p.description_Product ?? '',
      price_Product: Number(p.price_Product) || 0,
      stock_Product: Number(p.stock_Product) || 0,
    });
  }
}

