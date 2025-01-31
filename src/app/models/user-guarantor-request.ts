// user-guarantor-request.ts
export class UserGuarantorRequest {
    id: number = 0;
    name: string = '';
    relation: string = '';
    phoneNumber: string = '';
    emailId: string = '';

    constructor() {
      this.name = '';
      this.relation = '';
      this.phoneNumber = '';
      this.emailId = '';
    }
  }
