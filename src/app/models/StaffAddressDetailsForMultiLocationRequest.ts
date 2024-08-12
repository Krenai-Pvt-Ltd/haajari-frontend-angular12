export class OrganizationAddressDetail {
  id: number = 0;
  addressLine1: string = '';
  addressLine2: string = '';
  landmark: string = '';
  pincode: string = '';
  city: string = '';
  state: string = '';
  country: string = '';
  latitude: any;
  longitude: any;
  radius: string = '';
}

export class StaffListResponse {
  id: number = 0;
  name: string = '';
  email: string = '';
  image: string = '';
  uuid: string = '';
}

export class StaffAddressDetailsForMultiLocationRequest {
  organizationMultiLocationAddressDTO: OrganizationAddressDetail = new OrganizationAddressDetail();
  userUuidsList: String[] = [];
}