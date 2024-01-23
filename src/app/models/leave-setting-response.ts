export class LeaveSettingResponse {
    id!: number;
    templateName!: string;
    leaveCycle!: string;
    accrualType!: string;
    sandwichRules!: string;
    sandwichCount?: number;
    yearlyCycleEnd!: any;
    yearlyCycleStart!: Date;
    organizationId!: number; 
}  