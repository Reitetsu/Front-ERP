import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ProfileApiService } from '@core/services/profile-api.services';

import { ControlsOf, IProfile } from '@shared';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule,
  ],
})
export class ProfileSettings {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ProfileApiService);

  loading = false;
  loadError: string | null = null;

  reactiveForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    gender: ['', [Validators.required]],
    city: ['', [Validators.required]],
    address: ['', [Validators.required]],
    company: ['', [Validators.required]],
    mobile: ['', [Validators.required]],
    tele: ['', [Validators.required]],
    website: ['', [Validators.required]],
    date: ['', [Validators.required]],
  });


  ngOnInit(): void {
    this.loadMe();
  }

  private loadMe(): void {
    this.loading = true;
    this.loadError = null;

    this.api.me()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (vm) => {
          // Carga inicial: si tu backend no trae city/tele/website aún,
          // no queremos invalidar el form obligando esos campos.
          // Puedes:
          //  A) hacerlos opcionales mientras no existan en API, o
          //  B) asignar placeholders.
          // Aquí haré A: patchValue + no tocar lo que no venga.
          this.reactiveForm.patchValue({
            username: vm.username,
            email: vm.email,
            gender: vm.gender || '1', // si tu API no trae gender, set por defecto
            address: vm.address,
            company: vm.company,
            mobile: vm.mobile,
          });
        },
        error: (err) => {
          console.error('Profile me() error', err);
          this.loadError = 'No se pudo cargar el perfil.';
        },
      });
  }

  save(): void {
    if (this.reactiveForm.invalid) {
      this.reactiveForm.markAllAsTouched();
      return;
    }

    // Por ahora solo guardamos local: luego conectamos PUT/PATCH en backend
    console.log('SAVE PROFILE', this.reactiveForm.getRawValue());
  }
  getErrorMessage(form: FormGroup<ControlsOf<IProfile>>) {
    return form.get('email')?.hasError('required')
      ? 'You must enter a value'
      : form.get('email')?.hasError('email')
        ? 'Not a valid email'
        : '';
  }
}
