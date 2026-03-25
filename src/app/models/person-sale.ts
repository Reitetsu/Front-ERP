export interface PersonSale {
  id: number;
  documentNumber_Person?: string;
  names_Person?: string;
  lastName_Person?: string;
  secondLastName_Person?: string;
  genderId?: number;
  phoneNumber_Person?: string;
  email_Person?: string;
  dateBirth_Person?: string;
  address_Person?: string;
}

export interface PersonSearchResult {
  id: number;
  document_number_person?: string;
  names_person?: string;
  last_name_person?: string;
  second_last_name_person?: string;
  gender_id?: number;
  phone_number_person?: string;
  email_person?: string;
  date_birth_person?: string;
  address_person?: string;
}

export interface CreateSimplePersonDto {
  DocumentNumber_Person: string;
  PhoneNumber_Person: string;
  Address_Person: string;
}
