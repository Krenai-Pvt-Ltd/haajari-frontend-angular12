import { UserDocumentsRequest } from "./user-documents-request";
import { UserGuarantorRequest } from "./user-guarantor-request";

export class UserDocumentsDetailsRequest {
    userDocuments: UserDocumentsRequest = new UserDocumentsRequest();
    guarantors: UserGuarantorRequest[] = [];
}
