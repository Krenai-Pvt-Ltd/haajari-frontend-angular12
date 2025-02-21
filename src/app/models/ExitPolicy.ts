import { ExpensePolicy } from "./ExpensePolicy";

export class ExitPolicy{
    id: number = 0
    name: string =''
    noticePeriod: number = 0
    fnfPeriod: number = 0
    isLeaveTaken: number = 0
    
    selectedUserIds: number[] =[]
    deSelectedUserIds: number[] =[]
    removeUserIds: number[] =[]

    policyName: string ='';
    noticePeriodDuration: number = 0;
    userIds: number[] = []
}