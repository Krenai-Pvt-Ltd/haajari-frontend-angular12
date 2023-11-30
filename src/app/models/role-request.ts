export class RoleRequest {
    id !:  number;
    name !: string;
    description !: string;
    moduleRequestList !: ModuleRequest[];
}

export class ModuleRequest{

    subModuleId !: number;
    privilegeId !: number;
}