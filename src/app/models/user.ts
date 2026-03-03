

export interface User {
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
}
export interface Usuario{
    id: number;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    dateBirth: Date | null;
    documentNumber:string;
    genderId: number;
    role: string;
    secondLastName: string;
}
export interface UsuarioLaravel {
  id: number;                      // ID del usuario
  name: string;                    // Nombre de usuario
  email: string;                   // Correo electrónico
  role: string;                    // Rol como string
  cwUser?: CWUser;                 // Objeto CWUser si existe
}
export interface UserAndPersonDto {
    User: {
      id?: string;
      userName: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      address: string;
      // Completa con otros campos según sea necesario
    };
    Person: {
      documentNumber_Person: string;
      names_Person: string;
      lastName_Person: string;
      secondLastName_Person: string;
      genderId: number;
      email_Person: string;
      phoneNumber_Person: string;
      dateBirth_Person: Date;
      address_Person: string;
      userId: string;
      // Completa con otros campos según sea necesario
    };
    Role?: string; // Rol opcional
  }

  export interface CWUser {
    id: number;
    auth_user_id: number;
    company_id: number;
    create_ts: string; // Cambiado a string para mantener formato
    create_user: string;
    date_format_id: number;
    default_group_id: number;
    facility_id: number;
    person_id: number;
    failed_login_attempts: number;
    image_data?: string;
    image_file?: string;
    mod_ts?: string; // Cambiado a string para mantener formato
    mod_user?: string;
    restrict_work_area: boolean;
    rows_per_page: number;
    staff_account_life_in_days: number;
    theme_name: string;
    time_format_id: number;
}

