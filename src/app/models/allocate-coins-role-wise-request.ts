export interface AllocateCoinsRoleWiseRequest {
    allocatedCoins: number;
    donateLimitForManager?: number;
    donateLimitForUser?: number;
    donateLimitForTeamMates?: number;
    roleId: number;
  }

  export interface RolesForSuperCoinsResponse {
    id: number;
    name: string;
  }

  export interface AllocateCoinsRoleWiseResponse {
    allocatedCoins: number;
    donateLimitForManager: number;
    donateLimitForUser: number;
    donateLimitForTeamMates: number;
    roleName: number;
    assignedDate: Date;
  }
  