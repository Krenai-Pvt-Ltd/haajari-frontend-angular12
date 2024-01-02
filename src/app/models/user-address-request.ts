export class UserAddressRequest {
    address: string;
    pincode: string;
    city: string;
    state: string;
    country: string;
  
    constructor() {
      this.address = '';
      this.pincode = '';
      this.city = '';
      this.state = '';
      this.country = '';
    }
}
