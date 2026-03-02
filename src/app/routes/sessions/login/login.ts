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
import { AuthService } from '@core/authentication';
import { filter, finalize, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.scss',
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
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

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

    this.auth
      .login(email, password, rememberMe) // 👈 esto llama a LoginService.login y guarda token en TokenService
      .pipe(
        filter(authenticated => authenticated),
        // luego pedimos el usuario (usa /api/auth/me con Bearer automático)
        switchMap(() => this.auth.user().pipe(take(1))),
        take(1),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe({
        next: user => {
          const role = String(user?.roles ?? '').trim();

          if (role === 'Administrador' || role === 'Operario Recepcion' || role === 'Inventario') {
            this.router.navigate(['/layout/radiofrecuencia']);
          } else {
            this.loginError = 'No tienes permisos para acceder a esta aplicación';
          }
        },
        error: (errorRes: HttpErrorResponse) => {
          // Si tu backend devuelve 422 con errors, mapéalo al form
          if (errorRes.status === 422 && (errorRes.error as any)?.errors) {
            const errors = (errorRes.error as any).errors;
            Object.keys(errors).forEach(key => {
              // tu backend usa "login" en vez de "email" a veces; lo mapeamos
              const controlName = key === 'login' ? 'email' : key;
              this.loginForm.get(controlName)?.setErrors({ remote: errors[key][0] });
            });
            this.loginError = '';
          } else if (errorRes.status === 401) {
            this.loginError = 'Credenciales incorrectas';
          } else {
            this.loginError = 'Error en el servidor';
          }
        },
      });
  }
}
