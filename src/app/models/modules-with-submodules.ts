export class ModulesWithSubmodules {
        id!: number;
        name!: string;
        description!: string;
        isAccessible!: number;
        subModules!: SubModule[];
}

export interface SubModule {
    id: number;
    name: string;
    description: string;
    privilegeId: number;
    isAccessible: number;
  }
  