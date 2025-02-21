import { EmployeeAdditionalDocument } from "./employee-additional-document";
import { EmployeeCompanyDocumentsRequest } from "./employee-company-documents-request";
import { UserAcademicsDetailRequest } from "./user-academics-detail-request";
import { UserAddressRequest } from "./user-address-request";
import { UserBankDetailRequest } from "./user-bank-detail-request";
import { UserDocumentsRequest } from "./user-documents-request";
import { UserEmergencyContactDetailsRequest } from "./user-emergency-contact-details-request";
import { UserExperience } from "./user-experience";
import { UserGuarantorRequest } from "./user-guarantor-request";
import { UserPersonalInformationRequest } from "./user-personal-information-request";

export class OnboardingFormPreviewResponse {
    user: UserPersonalInformationRequest = new UserPersonalInformationRequest();;
    userAddress: UserAddressRequest[] = [];
    userDocuments: UserDocumentsRequest = new UserDocumentsRequest();
    userGuarantorInformation: UserGuarantorRequest[] = [];
    userAcademics: UserAcademicsDetailRequest = new UserAcademicsDetailRequest();
    userExperience: UserExperience[] = [];
    userBankDetails: UserBankDetailRequest = new UserBankDetailRequest();
    userEmergencyContacts: UserEmergencyContactDetailsRequest[] = [];
    employeeAdditionalDocuments: EmployeeAdditionalDocument[]= [];
    employeeCompanyDocuments: EmployeeCompanyDocumentsRequest[]= [];
    companyLogo: string = '';
    fresher: boolean = false;
    reasonOfRejection: string = '';


    constructor() {
        // this.user = new UserPersonalInformationRequest();
        // this.userAddress = [];
        // this.userDocuments = new UserDocumentsRequest();
        // this.userGuarantorInformation = [];
        // this.userExperience = [];
        // this.userBankDetails = new UserBankDetailRequest();
        // this.userAcademics = new UserAcademicsDetailRequest();
        // this.userEmergencyContacts = [];
        // this.employeeAdditionalDocuments = [];
        this.companyLogo = '';
        this.fresher = false;
        this.reasonOfRejection = '';
        this.employeeCompanyDocuments = [];
    }
}
