import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FacilityCreateDto } from 'src/app/models/facility';

@Component({
  selector: 'app-facility-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './facility-add.html',
  styleUrls: ['./facility-add.scss'],
})
export class FacilityAddComponent {
  private readonly fb = inject(FormBuilder);

  @Output() submitFacility = new EventEmitter<FacilityCreateDto>();
  @Output() cancel = new EventEmitter<void>();

  readonly form = this.fb.nonNullable.group({
    code_Facility: ['', [Validators.required, Validators.maxLength(50)]],
    name_Facility: ['', [Validators.required, Validators.maxLength(100)]],
    description_Facility: ['', [Validators.maxLength(255)]],
    address_Facility: ['', [Validators.maxLength(500)]],
    contact_Facility: ['', [Validators.maxLength(100)]],
    email_Facility: ['', [Validators.email, Validators.maxLength(255)]],
    phone_Facility: ['', [Validators.maxLength(20)]],
    facilityTypeId: [1, [Validators.required, Validators.min(1)]],
  });

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const dto: FacilityCreateDto = {
      code_Facility: v.code_Facility.trim().toUpperCase(),
      name_Facility: v.name_Facility.trim().toUpperCase(),
      description_Facility: (v.description_Facility ?? '').trim().toUpperCase(),
      address_Facility: (v.address_Facility ?? '').trim().toUpperCase(),
      contact_Facility: (v.contact_Facility ?? '').trim().toUpperCase(),
      email_Facility: (v.email_Facility ?? '').trim(),
      phone_Facility: (v.phone_Facility ?? '').trim(),
      facilityTypeId: Number(v.facilityTypeId) || 1,
    };

    this.submitFacility.emit(dto);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
