export class EmployeeOnboardingDataDto {
  id!: number;
  onboardingStatusUpdateDate!: string;
  uuid!: string;
  name!: string;
  email!: string;
  phoneNumber!: string;
  presenceStatus!: boolean;
  isEnable!: boolean;
  onboardingStatus!: string;
  teamsNameList!: UserTeamDetails[];
  slackUserId!: string;
  resignationStatus: any;
  userExistInExitPolicy: number = 0;
  employeeCode!: string;
  userShiftName!: string;
  userLeavePolicyName!: string;
}

export class UserTeamDetails {
   teamId!: number;
   teamName!: string;
   uuid!: string;
   createdDate!: Date;
}
