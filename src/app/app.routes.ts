import { Routes } from '@angular/router';
import { authGuard } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import { AuthLayout } from '@theme/auth-layout/auth-layout';
import { Dashboard } from './routes/dashboard/dashboard';
import { Error403 } from './routes/sessions/error-403';
import { Error404 } from './routes/sessions/error-404';
import { Error500 } from './routes/sessions/error-500';
import { Login } from './routes/sessions/login/login';
import { Register } from './routes/sessions/register/register';

export const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: '403', component: Error403 },
      { path: '404', component: Error404 },
      { path: '500', component: Error500 },
      {
        path: 'profile',
        loadChildren: () => import('./routes/profile/profile.routes').then(m => m.routes),
      },
      { path: 'menu', loadChildren: () => import('./routes/menus/menus.routes').then(m => m.MENUS_ROUTES) },
      { path: 'product', loadChildren: () => import('./routes/products/products.routes').then(m => m.PRODUCTS_ROUTES) },
      { path: 'facility', loadChildren: () => import('./routes/facilities/facilities.routes').then(m => m.FACILITIES_ROUTES) },
      { path: 'sale', loadChildren: () => import('./routes/sales/sales.routes').then(m => m.SALES_ROUTES) },
      { path: 'payment', loadChildren: () => import('./routes/payments/payments.routes').then(m => m.PAYMENTS_ROUTES) },
    ],
  },
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      { path: 'login', component: Login },
      { path: 'register', component: Register },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
