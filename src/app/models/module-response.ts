export class ModuleResponse {
    id !: number;
    name !: string;
    description !: string;
    isAccessible !: number;
    privilegeId !: number;
    subModules !: SubModule[];
}

export class SubModule {
    id !: number;
    name !: string;
    description !: string;
    privilegeId !: number;
    isAccessible !: number;
}
