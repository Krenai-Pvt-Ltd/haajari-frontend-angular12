import { Component, Input, OnInit } from '@angular/core';
import { EarningComponent } from 'src/app/payroll-models/EarrningComponent';
import { TaxSlabService } from 'src/app/services/tax-slab.service';

@Component({
  selector: 'app-earning-details',
  templateUrl: './earning-details.component.html',
  styleUrls: ['./earning-details.component.css']
})
export class EarningDetailsComponent implements OnInit {



  VALUE_TYPE_PERCENTAGE=1;
  VALUE_TYPE_FLAT=2;
  CALCULATION_BASED_CTC=3;
  CALCULATION_BASED_BASIC=4;
  PAY_TYPE_FIXED=5;
  PAY_TYPE_VARIABLE=6;

  earningId!: any;
  currentTab:any;
  movedBack:boolean=false;
  selectedEarning!: EarningComponent; 
  moved:boolean=true;

  constructor(
    private taxSlabService: TaxSlabService,
    
  ) {
  }

  ngOnInit(): void {
    this.taxSlabService.earning$.subscribe(earning => {
      if (earning) {
        this.selectedEarning = earning;
        console.log(this.selectedEarning)
      }
    });
  }

  goBack(tabName: string) {
  this.moved=false;

}



}
