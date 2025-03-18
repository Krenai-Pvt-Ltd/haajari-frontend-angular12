import { ComponentConfiguration } from "./ComponentConfiguration";

export class BenefitComponent{
    id:number=0;
    name:string='';
    displayName:string='';
    statusId:number=0;
    payTypeId:number=0;
    isCustom:boolean=false;
    configurations:ComponentConfiguration[]= new Array();

}