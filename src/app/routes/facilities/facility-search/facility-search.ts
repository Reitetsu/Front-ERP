import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FacilitySearchDto } from 'src/app/models/facility';

@Component({
  selector: 'app-facility-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatDividerModule, MatFormFieldModule, MatInputModule],
  templateUrl: './facility-search.html',
  styleUrls: ['../facility-add/facility-add.scss'],
})
export class FacilitySearchComponent {
  private readonly fb = inject(FormBuilder);

  @Output() search = new EventEmitter<FacilitySearchDto>();
  @Output() close = new EventEmitter<void>();

  readonly form = this.fb.nonNullable.group({
    code_Facility: [''],
    name_Facility: [''],
    description_Facility: [''],
    address_Facility: [''],
    contact_Facility: [''],
    email_Facility: [''],
    phone_Facility: [''],
    facilityTypeId: [0],
  });

  onSearch(): void {
    const v = this.form.getRawValue();

    const dto: FacilitySearchDto = {
      code_Facility: this.clean(v.code_Facility),
      name_Facility: this.clean(v.name_Facility),
      description_Facility: this.clean(v.description_Facility),
      address_Facility: this.clean(v.address_Facility),
      contact_Facility: this.clean(v.contact_Facility),
      email_Facility: this.clean(v.email_Facility),
      phone_Facility: this.clean(v.phone_Facility),
      facilityTypeId: v.facilityTypeId > 0 ? Number(v.facilityTypeId) : undefined,
    };

    this.search.emit(dto);
  }

  onReset(): void {
    this.form.reset({
      code_Facility: '',
      name_Facility: '',
      description_Facility: '',
      address_Facility: '',
      contact_Facility: '',
      email_Facility: '',
      phone_Facility: '',
      facilityTypeId: 0,
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
