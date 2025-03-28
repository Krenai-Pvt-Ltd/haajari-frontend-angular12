export class ProfessionalTax{
     id:number=0;
     branch:string='';
     professionalTaxNumber:string='';
     state:string='';
     deductionFrequency:string='';
     professionalTaxSlab: ProfessionalTaxSlab[] = [];
     taxApplicable:boolean = false;
}

export class ProfessionalTaxSlab{
    minAmount:number=0;
    maxAmount:number=0;
    taxAmount:number=0;
}