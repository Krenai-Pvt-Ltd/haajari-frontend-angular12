export class EarningComponent{
    id:number=0;
    name:string='';
    displayName:string='';
    statusId:number=0;
    value:number=0;
    calculationBasedId:number=0;
    valueTypeId:number=0;
    payTypeId:number=0;
    canStatusChange:boolean=false;
    configurations:ComponentConfiguration[]=[];
}

export class ComponentConfiguration{
      id:number=0;
	 name:string='';
	 description:string='';
	  isEditable:boolean=false;
	  isChecked:boolean=false;
	  configurationId:number=0;
}