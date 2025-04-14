import { ComponentConfiguration } from "./ComponentConfiguration";

export class EarningComponent{
    id:number=0;
    name:string='';
    displayName:string='';
    paySlipName:string='';
    statusId:number=0;
    value:number=0;
    calculationBasedId:number=0;
    valueTypeId:number=0;
    payTypeId:number=0;
    canStatusChange:boolean=false;
    custom:boolean=false;
    deletion:boolean=false;
    configurations:ComponentConfiguration[]= new Array();
}