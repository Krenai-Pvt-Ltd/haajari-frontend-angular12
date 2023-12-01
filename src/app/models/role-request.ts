import { ModuleRequest } from "./module-request";

export class RoleRequest {
    id !:  number;
    name !: string;
    description !: string;
    moduleRequestList !: ModuleRequest[];
}
