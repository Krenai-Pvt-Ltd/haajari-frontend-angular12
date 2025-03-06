export class ProfessionalTax{
     id:number=0;
     professionalTaxNumber:string='';
     state:string='';
     deductionFrequency:string='';
     professionalTaxSlab: ProfessionalTaxSlab[] = [];
}

export class ProfessionalTaxSlab{
    minAmount:number=0;
    maxAmount:number=0;
    taxAmount:number=0;
}