export interface AllocateCoinsRoleWiseRequest {
    allocatedCoins: number;
    donateLimitForManager?: number;
    donateLimitForUser?: number;
    donateLimitForTeamMates?: number;
    roleId: number;
  }

  export interface RolesForSuperCoinsResponse {
    roleId: number;
    roleName: string;
  }

  export interface AllocateCoinsRoleWiseResponse {
    id: number;
    allocatedCoins: number;
    donateLimitForManager: number;
    donateLimitForUser: number;
    donateLimitForTeamMates: number;
    roleName: number;
    assignedDate: Date;
  }
  