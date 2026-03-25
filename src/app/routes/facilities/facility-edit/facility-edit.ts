import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Facility, FacilityUpdateDto } from 'src/app/models/facility';

@Component({
  selector: 'app-facility-edit',
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
  templateUrl: './facility-edit.html',
  styleUrls: ['../facility-add/facility-add.scss'],
})
export class FacilityEditComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() facility: Facility | null = null;

  @Output() submitFacility = new EventEmitter<FacilityUpdateDto>();
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['facility']) {
      this.patchFromFacility();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const dto: FacilityUpdateDto = {
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

  private patchFromFacility(): void {
    const f = this.facility;
    if (!f) {
      return;
    }

    this.form.reset({
      code_Facility: f.code_Facility ?? '',
      name_Facility: f.name_Facility ?? '',
      description_Facility: f.description_Facility ?? '',
      address_Facility: f.address_Facility ?? '',
      contact_Facility: f.contact_Facility ?? '',
      email_Facility: f.email_Facility ?? '',
      phone_Facility: f.phone_Facility ?? '',
      facilityTypeId: Number(f.facilityTypeId) || 1,
    });
  }
}
