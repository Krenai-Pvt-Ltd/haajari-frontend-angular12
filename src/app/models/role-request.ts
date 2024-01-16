import { ModuleRequest } from "./module-request";

export class RoleRequest {
    id :  number = 0;
    name : string = '';
    description : string = '';
    roleAccessibilityTypeId : number = 0;
    moduleRequestList : ModuleRequest[] = [];
}
