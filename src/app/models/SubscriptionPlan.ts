export class SubscriptionPlan{
    id: number = 0;
    name!: string;
    description!: string;
    amount!: number;
    serviceList: any[] = new Array();
}