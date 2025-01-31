export class ExpenseType{

    id: number = 0;
    expenseTypeId: number = 0;
    // amount: number = 0;
    amount: any;
    notes: string = '';
    url: string = '';
    paymentMethod: string = 'CASH';
    urls: string[] = new Array()
    expenseDate: any;
    settledDate: any;
    managerId: number = 0
    status: any;
    approvedAmount: number = 0
    tags: string[] = [];
}
