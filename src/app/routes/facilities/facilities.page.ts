import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FacilityComponent } from './facility/facility';

@Component({
  selector: 'app-facilities-page',
  standalone: true,
  imports: [CommonModule, FacilityComponent],
  template: `<app-facility />`,
})
export class FacilitiesPage {}
