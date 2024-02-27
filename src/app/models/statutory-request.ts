import { OrganizationStatutoryAttributeRequest } from "./organization-statutory-attribute-request";

export class StatutoryRequest {
    id : number = 0;
    name : string = '';
    switchValue: boolean = false;
    organizationStatutoryAttributeRequestList : OrganizationStatutoryAttributeRequest[] = [];
}
