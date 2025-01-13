export class ApproveReq{
    
    id: number = 0;
    statusId: number = 0;
    amount: any
    message: string = ''
    rejectionReason: string =''
    isPartiallyPayment: number = 0;
    paymentMethod: string = ''
    transactionId: string = ''
    settledDate: any;

    approvedAmount: any;
}