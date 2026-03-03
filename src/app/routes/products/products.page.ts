import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductComponent } from './product/product';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, ProductComponent],
  template: `<app-product />`,
})
export class ProductsPage {}
