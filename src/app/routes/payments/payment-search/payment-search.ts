import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PaymentSearchDto } from 'src/app/models/payment';

@Component({
  selector: 'app-payment-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  templateUrl: './payment-search.html',
  styleUrls: ['../../menus/menu-add/menu-add.scss'],
})
export class PaymentSearchComponent {
  private readonly fb = inject(FormBuilder);

  @Output() search = new EventEmitter<PaymentSearchDto>();
  @Output() close = new EventEmitter<void>();

  readonly form = this.fb.group({
    id: [''],
    cashRegisterId: [''],
    saleId: [''],
    paymentTypeId: [''],
    amountFrom: [''],
    amountTo: [''],
    dateFrom: [null as Date | null],
    dateTo: [null as Date | null],
    status: [''],
  });

  onSearch(): void {
    const raw = this.form.getRawValue();
    this.search.emit({
      id: this.toNumberOrNull(raw.id),
      cashRegisterId: this.toNumberOrNull(raw.cashRegisterId),
      saleId: this.toNumberOrNull(raw.saleId),
      paymentTypeId: this.toNumberOrNull(raw.paymentTypeId),
      amountFrom: this.toNumberOrNull(raw.amountFrom),
      amountTo: this.toNumberOrNull(raw.amountTo),
      dateFrom: this.toDateOnlyString(raw.dateFrom),
      dateTo: this.toDateOnlyString(raw.dateTo),
      status: this.toTextOrUndefined(raw.status),
    });
  }

  onReset(): void {
    this.form.reset({
      id: '',
      cashRegisterId: '',
      saleId: '',
      paymentTypeId: '',
      amountFrom: '',
      amountTo: '',
      dateFrom: null,
      dateTo: null,
      status: '',
    });
  }

  onClose(): void {
    this.close.emit();
  }

  private toNumberOrNull(value: unknown): number | null {
    const text = value == null ? '' : String(value).trim();
    if (!text) return null;
    const n = Number(text);
    return Number.isFinite(n) ? n : null;
  }

  private toTextOrUndefined(value: unknown): string | undefined {
    const text = value == null ? '' : String(value).trim();
    return text.length > 0 ? text : undefined;
  }

  private toDateOnlyString(value: unknown): string | undefined {
    if (value == null) return undefined;

    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return undefined;
      return [
        value.getFullYear(),
        String(value.getMonth() + 1).padStart(2, '0'),
        String(value.getDate()).padStart(2, '0'),
      ].join('-');
    }

    const text = String(value).trim();
    return text.length > 0 ? text : undefined;
  }
}
