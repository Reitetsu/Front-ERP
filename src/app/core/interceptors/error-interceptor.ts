import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { catchError, throwError } from 'rxjs';

export enum STATUS {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export function errorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const router = inject(Router);
  const toast = inject(HotToastService);
  const errorPages = [STATUS.FORBIDDEN, STATUS.NOT_FOUND, STATUS.INTERNAL_SERVER_ERROR];

  const getMessage = (error: HttpErrorResponse) => {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.error?.msg) {
      return error.error.msg;
    }
    return `${error.status} ${error.statusText}`;
  };

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isExpectedNoPayments404 =
        error.status === STATUS.NOT_FOUND && req.url.includes('/api/Payment/by-saleId/');
      const isExpectedPersonNotFound404 =
        error.status === STATUS.NOT_FOUND && req.url.includes('/api/Person/search');
      const isExpectedCustomerNotFound404 =
        error.status === STATUS.NOT_FOUND && req.url.includes('/api/Customer/verificar-cliente');

      if (isExpectedNoPayments404 || isExpectedPersonNotFound404 || isExpectedCustomerNotFound404) {
        return throwError(() => error);
      }

      if (errorPages.includes(error.status)) {
        router.navigateByUrl(`/${error.status}`, {
          skipLocationChange: true,
        });
      } else {
        console.error('ERROR', error);
        toast.error(getMessage(error));
        if (error.status === STATUS.UNAUTHORIZED) {
          router.navigateByUrl('/auth/login');
        }
      }

      return throwError(() => error);
    })
  );
}
