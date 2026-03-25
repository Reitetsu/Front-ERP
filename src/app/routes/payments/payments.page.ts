import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PaymentsComponent } from './payment/payment';

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [CommonModule, PaymentsComponent],
  template: `<app-payments />`,
})
export class PaymentsPage {}

