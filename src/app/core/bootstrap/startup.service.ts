import { Injectable, inject } from '@angular/core';
import { AuthService, User } from '@core/authentication';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { switchMap, tap } from 'rxjs';
import { Menu, MenuService } from './menu.service';

@Injectable({
  providedIn: 'root',
})
export class StartupService {
  private readonly authService = inject(AuthService);
  private readonly menuService = inject(MenuService);
  private readonly permissonsService = inject(NgxPermissionsService);
  private readonly rolesService = inject(NgxRolesService);

  /**
   * Load the application only after get the menu or other essential informations
   * such as permissions and roles.
   */
  load() {
    return new Promise<void>((resolve, reject) => {
      this.authService
        .change()
        .pipe(
          tap(user => this.setPermissions(user)),
          switchMap(() => this.authService.menu()),
          tap(menu => this.setMenu(menu))
        )
        .subscribe({
          next: () => resolve(),
          error: () => resolve(),
        });
    });
  }

  private setMenu(menu: Menu[]) {
    const safeMenu = [...(menu ?? [])];
    const hasMenu = safeMenu.some(item => this.normalizeRoute(item.route) === '/menu');
    const hasFacility = safeMenu.some(item => this.normalizeRoute(item.route) === '/facility');
    const hasSale = safeMenu.some(item => this.normalizeRoute(item.route) === '/sale');
    const hasPayment = safeMenu.some(item => this.normalizeRoute(item.route) === '/payment');

    if (!hasMenu) {
      safeMenu.push({
        route: '/menu',
        name: 'menu',
        type: 'link',
        icon: 'restaurant_menu',
      });
    }

    if (!hasSale) {
      safeMenu.push({
        route: '/sale',
        name: 'sale',
        type: 'link',
        icon: 'point_of_sale',
      });
    }

    if (!hasFacility) {
      safeMenu.push({
        route: '/facility',
        name: 'facility',
        type: 'link',
        icon: 'store',
      });
    }

    if (!hasPayment) {
      safeMenu.push({
        route: '/payment',
        name: 'payment',
        type: 'link',
        icon: 'payments',
      });
    }

    this.menuService.addNamespace(safeMenu, 'menu');
    this.menuService.set(safeMenu);
  }

  private normalizeRoute(route: string | undefined): string {
    if (!route) {
      return '';
    }
    return `/${route.replace(/^\/+|\/+$/g, '')}`;
  }

  private setPermissions(user: User) {
    // In a real app, you should get permissions and roles from the user information.
    const permissions = ['canAdd', 'canDelete', 'canEdit', 'canRead'];
    this.permissonsService.loadPermissions(permissions);
    this.rolesService.flushRoles();
    this.rolesService.addRoles({ ADMIN: permissions });

    // Tips: Alternatively you can add permissions with role at the same time.
    // this.rolesService.addRolesWithPermissions({ ADMIN: permissions });
  }
}
