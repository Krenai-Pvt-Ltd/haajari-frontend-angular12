import { UserAddressRequest } from "./user-address-request";

export class UserAddressDetailsRequest {
    
    directSave: boolean = false;
    sameAddress: boolean = true; 
    updateRequest !: boolean;
    userAddressRequest: UserAddressRequest[] = [];
    statusId: number = 0;
    employeeOnboardingStatus : string = '';
    employeeOnboardingFormStatus : string = '';
}
