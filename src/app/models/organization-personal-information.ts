import { Organization } from "./organization";


export class OrganizationPersonalInformation {

  id!: number;
  name!: string;
  email!: string;
  password!: string;
  state!: string;
  country!: string;
//   organizationPic!: any; 
  organization!: Organization;
}
