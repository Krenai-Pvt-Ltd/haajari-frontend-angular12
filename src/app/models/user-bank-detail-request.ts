export class UserBankDetailRequest {
    accountHolderName: string = '';
    bankName: string = '';
    accountNumber: string = '';
    ifsc: string = '';
    statusResponse: string = '';
    statusId: number = 0;
    directSave: boolean = false;
    employeeOnboardingStatus : string = '';
    employeeOnboardingFormStatus : string = '';
}
