import { ComponentConfiguration } from "./ComponentConfiguration";

export class BenefitComponent{
    id:number=0;
    name:string='';
    displayName:string='';
    statusId:number=12;
    payTypeId:number=0;
    isCustom:boolean=false;
    frequencyId:number=7;
    benefitTypeId:number=2;
	taxExemptionId:number=0;
    configurations:ComponentConfiguration[]= new Array();

}