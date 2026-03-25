import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { Measurement } from '../../../models/measurement';
import { ProductSearchDto } from '../../../models/product';
import { ProductType } from '../../../models/product-type';

@Component({
  selector: 'app-producto-search',
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
  templateUrl: './producto-search.html',
  styleUrls: ['../producto-add/producto-add.scss'],
})
export class ProductoSearch {
  private readonly fb = inject(FormBuilder);

  @Input() productTypes: ProductType[] = [];
  @Input() measurements: Measurement[] = [];
  @Input() codeCompany = '';

  @Output() search = new EventEmitter<ProductSearchDto>();
  @Output() close = new EventEmitter<void>();

  readonly form = this.fb.nonNullable.group({
    code_Product: [''],
    barcode_Product: [''],
    name_Product: [''],
    description_Product: [''],
    productTypeId: [0],
    measurementId: [0],
    price_Product: [0],
    stock_Product: [0],
  });

  onSearch(): void {
    const v = this.form.getRawValue();

    const dto: ProductSearchDto = {
      code_company: this.codeCompany || undefined,
      code_Product: this.clean(v.code_Product),
      barcode_Product: this.clean(v.barcode_Product),
      name_Product: this.clean(v.name_Product),
      description_Product: this.clean(v.description_Product),
      productTypeId: v.productTypeId > 0 ? v.productTypeId : undefined,
      measurementId: v.measurementId > 0 ? v.measurementId : undefined,
      price_Product: v.price_Product > 0 ? Number(v.price_Product) : undefined,
      stock_Product: v.stock_Product > 0 ? Number(v.stock_Product) : undefined,
    };

    this.search.emit(dto);
  }

  onReset(): void {
    this.form.reset({
      code_Product: '',
      barcode_Product: '',
      name_Product: '',
      description_Product: '',
      productTypeId: 0,
      measurementId: 0,
      price_Product: 0,
      stock_Product: 0,
    });
  }

  onClose(): void {
    this.close.emit();
  }

  private clean(value: string): string | undefined {
    const trimmed = (value ?? '').trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
}

