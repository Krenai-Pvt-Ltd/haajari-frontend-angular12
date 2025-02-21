export interface UserDTO {
  id: number;
  name: string;
  phoneNumber: string | null;
  notificationVia: number;
  uuid: string;
  languagePreferred: number;
  email: string | null;
}
