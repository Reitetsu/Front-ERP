export interface Facility {
  id: number;
  code_Facility: string;
  name_Facility: string;
  description_Facility: string;
  address_Facility: string;
  contact_Facility: string;
  email_Facility: string;
  phone_Facility: string;
  facilityTypeId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacilitySearchDto {
  code_Facility?: string;
  name_Facility?: string;
  description_Facility?: string;
  address_Facility?: string;
  contact_Facility?: string;
  email_Facility?: string;
  phone_Facility?: string;
  facilityTypeId?: number;
}

export type FacilityCreateDto = Omit<Facility, 'id' | 'createdAt' | 'updatedAt'> & {
  companyId?: number;
};

export type FacilityUpdateDto = Partial<FacilityCreateDto>;
