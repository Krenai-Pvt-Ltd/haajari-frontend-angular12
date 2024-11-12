import { ExpensePolicy } from "./ExpensePolicy";

export class CompanyExpense{
    policyName: string =''
    expensePolicyList: ExpensePolicy[] = []
    selectedUserIds: number[] =[]
    deSelectedUserIds: number[] =[]
}