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

  export interface RemainingBadgesResponse {
    badgeId: number;
    badgeName: string;
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

  export interface AllocateCoinsToBadgeRequest {
    assignedMinCoins: number;
    assignedMaxCoins: number;
    badgeId: number;
    badgeName: string;
    badgeLogo: string;
  }

  export interface CoinsForBadgesResponse {
    id: number;
    badgeLogo: string;
    badgeName: string;
    assignedMinCoins: number;
    assignedMaxCoins: number;
    assignedDate: Date;
  }

  export interface DonateCoinsUserList {
    userId: number;
    userName: string;
  }

  export interface DonateSuperCoinsReasonResponse {
    id: number;
    reason: string;
  }

  
  
  