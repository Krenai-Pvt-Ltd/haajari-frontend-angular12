export class SubscriptionPlan{
    id: number = 0;
    name: string = '';
    description!: string;
    amount: number = 0;
    serviceList: any[] = new Array();
    isPurchased: number = 0;
}