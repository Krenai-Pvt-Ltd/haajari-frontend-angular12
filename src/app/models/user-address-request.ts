export class UserAddressRequest {
    id: number;
    addressLine1: string;
    addressLine2: string;
    pincode: string;
    city: string;
    state: string;
    country: string;
  
    constructor() {
      this.id = 0;
      this.addressLine1 = '';
      this.addressLine2 = '';
      this.pincode = '';
      this.city = '';
      this.state = '';
      this.country = '';
    }
}
