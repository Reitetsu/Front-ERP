import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MtxButtonModule } from '@ng-matero/extensions/button';

import { UserService } from '../service/user.service';
import { AuthLaravelService } from '../shared/Services/auth-laravel.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,

    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MtxButtonModule,
  ],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly authLaravelService = inject(AuthLaravelService);

  hidePassword = true;
  isSubmitting = false;
  loginError = '';

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });

  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onLogin(): void {
    this.loginError = '';

    if (this.loginForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const { email, password, rememberMe } = this.loginForm.getRawValue();

    this.authLaravelService.login(email, password).subscribe({
      next: (userData: any) => {
        // Si tu backend devuelve token, aquí puedes guardarlo:
        // if (userData?.token) localStorage.setItem('token', userData.token);

        if (userData && userData.role) {
          this.userService.setUserData({
            id: userData.id,
            userName: userData.userName,
            email: userData.email,
            role: userData.role,
            facility: userData.facility,
            facilityId: userData.facilityId,
            company: userData.company,
            firstName: userData.firstName,
            lastName: userData.lastName,
          });

          // Si quieres recordar sesión
          if (rememberMe) {
            localStorage.setItem('rememberMe', '1');
          } else {
            localStorage.removeItem('rememberMe');
          }

          // Tus rutas por rol (mismo comportamiento que tenías)
          const role = String(userData.role).trim();

          if (role === 'Administrador' || role === 'Operario Recepcion' || role === 'Inventario') {
            this.router.navigate(['/layout/radiofrecuencia']);
          } else {
            this.loginError = 'No tienes permisos para acceder a esta aplicación';
          }
        } else {
          this.loginError = 'Solicita tu rol';
        }

        this.isSubmitting = false;
      },
      error: (errorRes: HttpErrorResponse) => {
        // Si tu backend manda validaciones 422 (como ng-matero demo), mapeamos a form errors:
        if (errorRes.status === 422 && errorRes.error?.errors) {
          const errors = errorRes.error.errors;
          Object.keys(errors).forEach(key => {
            // ejemplo: { email: ["mensaje"] }
            const control = this.loginForm.get(key);
            control?.setErrors({ remote: errors[key][0] });
          });
          this.loginError = '';
        } else {
          this.loginError = 'Credenciales incorrectas o error en el servidor';
        }

        this.isSubmitting = false;
      },
    });
  }
}