import { SubscriptionPlan } from "./SubscriptionPlan";

export class OrganizationSubscriptionDetail{

    planName:string='';
    planAmount:number=0;
    startDate:string='';
    endDate:string='';
    yearly:boolean=false;
    expired:boolean=false;
    custom:boolean=false;
    employeeQuota:number=0;
    quotaUsed:number=0;
    plan!:SubscriptionPlan; 
}