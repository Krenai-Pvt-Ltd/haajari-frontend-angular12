
import { StatutoryAttributeRequest } from "./statutory-attribute-request";

export class StatutoryRequest {
    id : number = 0;
    name : string = '';
    switchValue: boolean = false;
    statutoryAccountNumber : string = '';
    statutoryAttributeRequestList : StatutoryAttributeRequest[] = [];
}
