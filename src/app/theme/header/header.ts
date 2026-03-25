import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import screenfull from 'screenfull';

import { Branding } from '../widgets/branding';
import { GithubButton } from '../widgets/github-button';
import { NotificationButton } from '../widgets/notification-button';
import { TranslateButton } from '../widgets/translate-button';
import { UserButton } from '../widgets/user-button';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: {
    class: 'matero-header',
  },
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    Branding,
    //GithubButton, si algun dia se necesita
    NotificationButton,
    TranslateButton,
    UserButton,
  ],
})
export class Header implements OnInit {
  companies: CompanyOption[] = [];
  facilities: FacilityOption[] = [];
  selectedCompany = 0;
  selectedFacility = 0;

  readonly showToggle = input(true);
  readonly showBranding = input(false);

  readonly toggleSidenav = output<void>();
  readonly toggleSidenavNotice = output<void>();

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  toggleFullscreen() {
    if (screenfull.isEnabled) {
      screenfull.toggle();
    }
  }

  onCompanyChange(): void {
    if (!this.selectedCompany) {
      this.facilities = [];
      this.selectedFacility = 0;
      localStorage.removeItem('company_id');
      localStorage.removeItem('selectedCompanyId');
      localStorage.removeItem('selectedCompanyCode');
      return;
    }

    const company = this.companies.find(c => c.id === this.selectedCompany);
    localStorage.setItem('company_id', String(this.selectedCompany));
    localStorage.setItem('selectedCompanyId', String(this.selectedCompany));
    localStorage.setItem('selectedCompanyCode', company?.code_Company ?? '');

    this.loadFacilities(this.selectedCompany);
  }

  onFacilityChange(): void {
    if (!this.selectedFacility) {
      localStorage.removeItem('facility_id');
      localStorage.removeItem('facilityId');
      localStorage.removeItem('selectedFacilityId');
      localStorage.removeItem('selectedFacilityCode');
      localStorage.removeItem('selectedFacility');
      return;
    }

    const facility = this.facilities.find(f => f.id === this.selectedFacility);
    localStorage.setItem('facility_id', String(this.selectedFacility));
    localStorage.setItem('facilityId', String(this.selectedFacility));
    localStorage.setItem('selectedFacilityId', String(this.selectedFacility));
    localStorage.setItem('selectedFacilityCode', facility?.code_Facility ?? '');
    localStorage.setItem('selectedFacility', facility?.code_Facility ?? '');
  }

  private loadCompanies(): void {
    this.http.get<CompanyOption[] | { data?: CompanyOption[] }>('/Company').subscribe({
      next: res => {
        const list = Array.isArray(res) ? res : res?.data ?? [];
        this.companies = list;

        const storedCompanyId = Number(
          localStorage.getItem('company_id') ?? localStorage.getItem('selectedCompanyId')
        );

        if (Number.isFinite(storedCompanyId) && storedCompanyId > 0) {
          this.selectedCompany = storedCompanyId;
          this.cdr.detectChanges();
        } else if (this.companies.length > 0) {
          this.selectedCompany = this.companies[0].id;
          this.cdr.detectChanges();
        }

        if (this.selectedCompany) {
          const company = this.companies.find(c => c.id === this.selectedCompany);
          localStorage.setItem('company_id', String(this.selectedCompany));
          localStorage.setItem('selectedCompanyId', String(this.selectedCompany));
          localStorage.setItem('selectedCompanyCode', company?.code_Company ?? '');
          this.loadFacilities(this.selectedCompany);
        }
      },
      error: () => {
        this.companies = [];
      },
    });
  }

  private loadFacilities(companyId: number): void {
    this.http
      .get<FacilityOption[] | { data?: FacilityOption[] }>(`/Facility/company/${companyId}`)
      .subscribe({
        next: res => {
          const list = Array.isArray(res) ? res : res?.data ?? [];
          this.facilities = list;

          const storedFacilityId = Number(
            localStorage.getItem('facility_id') ??
              localStorage.getItem('facilityId') ??
              localStorage.getItem('selectedFacilityId')
          );

          if (Number.isFinite(storedFacilityId) && storedFacilityId > 0) {
            this.selectedFacility = storedFacilityId;
            this.cdr.detectChanges();
          } else if (this.facilities.length > 0) {
            this.selectedFacility = this.facilities[0].id;
            this.cdr.detectChanges();
          } else {
            this.selectedFacility = 0;
            this.cdr.detectChanges();
          }

          if (this.selectedFacility) {
            const facility = this.facilities.find(f => f.id === this.selectedFacility);
            localStorage.setItem('facility_id', String(this.selectedFacility));
            localStorage.setItem('facilityId', String(this.selectedFacility));
            localStorage.setItem('selectedFacilityId', String(this.selectedFacility));
            localStorage.setItem('selectedFacilityCode', facility?.code_Facility ?? '');
            localStorage.setItem('selectedFacility', facility?.code_Facility ?? '');
          }
        },
        error: () => {
          this.facilities = [];
          this.selectedFacility = 0;
        },
      });
  }
}

interface CompanyOption {
  id: number;
  code_Company: string;
}

interface FacilityOption {
  id: number;
  code_Facility: string;
}
