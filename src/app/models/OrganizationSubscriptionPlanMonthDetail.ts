export class OrganizationSubscriptionPlanMonthDetail{
    planId: number = 0;
    planName: string = '';
    planType: string = '';
    planAmount: number = 0;
    startDate: Date = new Date();
    endDate: Date = new Date();
    nextBillingDate: Date = new Date();
    viewCard: number = 0;
    subscribers: number = 0;
    totalEmployee: number = 0;
    remainingMonths: number = 0;
}