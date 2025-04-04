export class ExpensePolicy{

  
    //
    // amount: number = 0;
    // limitAmount: number = 0;
    // paymentType: number = 0;
    // isPercentage: number = 0;
   
    // expenseTypeName: string = ''

    // paymentStructure:
    // isThresold: boolean = false;
    // isFixed: boolean =false;
    // isPercent: boolean = false;

    /**
     * Enitiy variables
     */
    // id:number = 0;
    expenseTypeId: number = 0;
    expenseTypeName: string='';
    amount: number = 0;
    flexibleAmount: number =0;
    isFlexibleAmount :number=0;
    isPercentage: number | null = null;

    /**
     * display variables
     */
    isThresold:boolean=false;
    paymentType:string='';



    /**
     * API variables
     */
	limitAmount: number = 0;
	// paymentType:number = 0;


	
}