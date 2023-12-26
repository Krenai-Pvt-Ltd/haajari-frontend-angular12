export class LeaveSettingResponse {
    id!: number;
    templateName!: string;
    leaveCycle!: string;
    accrualType!: string;
    sandwichRules!: string;
    sandwichCount?: number;
    yearlyCycleEnd!: Date;
    yearlyCycleStart!: Date;
    organizationId!: number; 
}  