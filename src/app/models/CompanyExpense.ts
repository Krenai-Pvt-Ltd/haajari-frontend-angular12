import { ExpensePolicy } from "./ExpensePolicy";

export class CompanyExpense{
    id: number = 0
    policyName: string =''
    expensePolicyList: ExpensePolicy[] = []
    selectedUserIds: number[] =[]
    deSelectedUserIds: number[] =[]
    removeUserIds: number[] =[]
}