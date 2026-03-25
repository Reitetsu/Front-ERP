import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MenuComponent } from './menu/menu';

@Component({
  selector: 'app-menus-page',
  standalone: true,
  imports: [CommonModule, MenuComponent],
  template: `<app-menu />`,
})
export class MenusPage {}
