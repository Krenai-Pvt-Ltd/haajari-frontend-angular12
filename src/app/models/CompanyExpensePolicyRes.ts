import { CompanyExpensePolicyTypeRes } from "./CompanyExpensePolicyTypeRes";

export class CompanyExpensePolicyRes{
    
    id: number = 0;
    updatedDate: any;
    policyName: string = ''
    totalEmployees: number = 0;
    companyExpensePolicyTypeRes: CompanyExpensePolicyTypeRes[] = [];
    userIds: number[] = []
}