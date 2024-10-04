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
  teamNames!: string[];
  slackUserId!: string;
}
