import { UserDocumentsRequest } from "./user-documents-request";
import { UserGuarantorRequest } from "./user-guarantor-request";

export class UserDocumentsDetailsRequest {
    statusId: number =0;
    userDocuments: UserDocumentsRequest = new UserDocumentsRequest();
    guarantors: UserGuarantorRequest[] = [];
    directSave: boolean = false;
    employeeOnboardingFormStatus: string = '';
    employeeOnboardingStatus: string = '';

   
}
