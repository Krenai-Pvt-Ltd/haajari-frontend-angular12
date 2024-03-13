import { Organization } from "./organization";


export class OrganizationPersonalInformation {

  id: number=0;
  adminName: string = '';
  adminEmail: string = '';
  name: string='';
  email: string='';
  password: string='';
  state: string='';
  country: string='';
  logo: string='';
  city: string='';
  phoneNumber: string='';
  addressLine1: string='';
  addressLine2: string='';
  pincode: string='';
//   organizationPic!: any; 
  organization: Organization=new Organization();
}
