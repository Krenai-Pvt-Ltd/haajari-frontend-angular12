import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { PaySchedule } from 'src/app/payroll-models/PaySchedule';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollConfigurationService } from 'src/app/services/payroll-configuration.service';

@Component({
  selector: 'app-pay-schedule',
  templateUrl: './pay-schedule.component.html',
  styleUrls: ['./pay-schedule.component.css']
})
export class PayScheduleComponent implements OnInit {

  SalaryCalculationModeActualDays:number=1;
  SalaryCalculationModeOrganizationDays:number=2;
  PayDayLastDay:number=1;
  PayDaySpecificDay:number=2;

  selectedMonth: Date | null = null;

  constructor(
    private _payrollConfigurationService : PayrollConfigurationService,
    private _helperService : HelperService,
     private _route:ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    window.scroll(0,0);
    this.getPaySchedule();
  }


  isAnyFieldFocused = false;

  onFocus() {
    this.isAnyFieldFocused = true;
  }

  paySchedule:PaySchedule = new PaySchedule();
    getPaySchedule(){
      this._payrollConfigurationService.getPaySchedule().subscribe(
        (response) => {
          if(response.status){
            this.paySchedule= response.object;
            if(this.paySchedule==null){
              this.paySchedule = new PaySchedule();
            }
          }
        },
        (error) => {
  
        }
      );
    }

    financialYearStart!: Date;
    financialYearEnd!:Date;
    disableFinancialYearMonths = (current: Date): boolean => {
      if (!current) return false;
    
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth(); 
      let financialYearStart: Date;
      let financialYearEnd: Date;
    
      if (currentMonth >= 3) {
        financialYearStart = new Date(currentYear, 3, 1); 
        financialYearEnd = new Date(currentYear + 1, 5, 30); 
      } else {
        financialYearStart = new Date(currentYear - 1, 3, 1);
        financialYearEnd = new Date(currentYear, 5, 30); 
      }
      const selectedMonth = new Date(current.getFullYear(), current.getMonth(), 1);
      selectedMonth.setHours(0, 0, 0, 0);
      financialYearStart.setHours(0, 0, 0, 0);
      financialYearEnd.setHours(0, 0, 0, 0);
      return (
        selectedMonth.getTime() < financialYearStart.getTime() ||
        selectedMonth.getTime() > financialYearEnd.getTime()
      );
    };

    saveLoader:boolean=false;

  organizationDays = Array.from({ length: 11 }, (_, i) => ({ label: (i + 20).toString(), value: i + 20 }));
  PayDays = Array.from({ length: 28 }, (_, i) => ({ label: (i + 1).toString(), value: i + 1 }));  
  startAndEndDay = [
    ...Array.from({ length: 27 }, (_, i) => ({ label: (i + 1).toString(), value: i + 1 })), 
    { label: 'Last Day', value: 32 } 
  ];
  
  
  
  savePaySchedule(){
      this.saveLoader = true;
      this._payrollConfigurationService. savePaySchedule(this.paySchedule).subscribe(
        (response) => {
          if(response.status){
            this._helperService.showToast("Your Pay Schedule details has been updated successfully.", Key.TOAST_STATUS_SUCCESS);
            this.isAnyFieldFocused = false;
          }else{
            this._helperService.showToast("Error in saving your pay schedule.", Key.TOAST_STATUS_ERROR);
          }
          this.saveLoader = false;
        //   setTimeout(() => {
        //     this.route('prior-payroll');
        // }, 2000);
        },
        (error) => {
          this.saveLoader = false;
          this._helperService.showToast("Error in saving your pay schedule.", Key.TOAST_STATUS_ERROR);
  
        }
      );
}

endDateChanged(endDate: number) {
  if(endDate == 32){
    this.paySchedule.startDate = 1;
  }else{
    this.paySchedule.startDate = endDate+1;
  }

}

onSalaryCalculationModeChange(mode: number) {
  if (mode == this.SalaryCalculationModeActualDays) {
    this.paySchedule.modeDay = 0; 
  }
}

onPayModeChange(mode: number) {
  if (mode == this.PayDayLastDay) {
    this.paySchedule.payDay = 0; 
  }
}




currentTab: any= 'profile';
    route(tabName: string) {
      this.router.navigate(['/payroll/configuration'], {
        queryParams: { tab: tabName },
      });
      this.currentTab=tabName;
    }
  }
