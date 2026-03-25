import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SaleComponent } from './sale/sale';

@Component({
  selector: 'app-sales-page',
  standalone: true,
  imports: [CommonModule, SaleComponent],
  template: `<app-sale />`,
})
export class SalesPage {}
