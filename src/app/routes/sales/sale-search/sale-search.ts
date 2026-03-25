import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SaleSearchDto } from 'src/app/models/sale';

@Component({
  selector: 'app-sale-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatDividerModule, MatFormFieldModule, MatInputModule],
  templateUrl: './sale-search.html',
  styleUrls: ['../../menus/menu-add/menu-add.scss'],
})
export class SaleSearchComponent {
  private readonly fb = inject(FormBuilder);

  @Output() search = new EventEmitter<SaleSearchDto>();
  @Output() close = new EventEmitter<void>();

  readonly form = this.fb.nonNullable.group({
    code_Sale: [0],
    startDate: [''],
    endDate: [''],
    total_Sale: [0],
    status_Sale: [''],
    type_Sale: [''],
  });

  onSearch(): void {
    const v = this.form.getRawValue();

    const dto: SaleSearchDto = {
      code_Sale: v.code_Sale > 0 ? Number(v.code_Sale) : undefined,
      startDate: this.clean(v.startDate),
      endDate: this.clean(v.endDate),
      total_Sale: v.total_Sale > 0 ? Number(v.total_Sale) : undefined,
      status_Sale: this.clean(v.status_Sale),
      type_Sale: this.clean(v.type_Sale),
    };

    this.search.emit(dto);
  }

  onReset(): void {
    this.form.reset({
      code_Sale: 0,
      startDate: '',
      endDate: '',
      total_Sale: 0,
      status_Sale: '',
      type_Sale: '',
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
