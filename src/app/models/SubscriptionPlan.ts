export class SubscriptionPlan{
    id: number = 0;
    name: string = '';
    description: string='';
    amount: number = 0;
    discountType:string='';
    discountAmount:number=0;
    isMonthly:number=0;
    isYearly:number=0;
    isRecommended:number=0;
    isCustom:number=0;
    planType:string='';
    serviceList: any[] = new Array(); // REMOVE
    isPurchased: number = 0;
    htmlContent:string='';
}