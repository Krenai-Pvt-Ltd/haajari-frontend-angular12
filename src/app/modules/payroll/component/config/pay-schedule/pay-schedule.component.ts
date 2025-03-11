import { Component, OnInit } from '@angular/core';
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

  payDate: Date | null = null;
  selectedMonth: Date | null = null;

  constructor(
    private _payrollConfigurationService : PayrollConfigurationService,
    private _helperService : HelperService,
    private route : 
  ) { }

  ngOnInit(): void {
    this.getPaySchedule();
  }

  paySchedule:PaySchedule = new PaySchedule();
    getPaySchedule(){
      this._payrollConfigurationService.getPaySchedule().subscribe(
        (response) => {
          if(response.status){
            this.paySchedule= response.object;
            this.selectedMonth =this.paySchedule.payrollStartDate;
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
      const currentMonth = today.getMonth(); // 0-based (Jan = 0, Apr = 3)
    
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


    onPayPeriodChange(selectedDate : Date){
      if (selectedDate instanceof Date && !isNaN(selectedDate.getTime())) { 
        const month = selectedDate.getMonth(); 
        const year = selectedDate.getFullYear();


        this.paySchedule.payrollStartDate = this.calculatePayDate(month, year);
      }
    }

    calculatePayDate(selectedMonth: number, selectedYear: number): Date {
      return new Date(selectedYear, selectedMonth + 1, this.paySchedule.payDay); 
    }

    disabledDate = (current: Date | null): boolean => {
      if (!current || !this.paySchedule?.payrollStartDate) {
        return true; 
      }
    
      const selectedDate = new Date(this.paySchedule.payrollStartDate);
      selectedDate.setHours(0, 0, 0, 0);
      current.setHours(0, 0, 0, 0);
      return current.getTime() !== selectedDate.getTime();
    };
    

    saveLoader:boolean=false;

  organizationDays = Array.from({ length: 11 }, (_, i) => ({ label: (i + 20).toString(), value: i + 20 }));
  PayDays = Array.from({ length: 28 }, (_, i) => ({ label: (i + 1).toString(), value: i + 1 }));  
  
  
  savePaySchedule(){
      this.saveLoader = true;
      this._payrollConfigurationService. savePaySchedule(this.paySchedule).subscribe(
        (response) => {
          if(response.status){
            this._helperService.showToast("Your Pay Schedule details has been updated successfully.", Key.TOAST_STATUS_SUCCESS);
          }else{
            this._helperService.showToast("Error in saving your pay schedule.", Key.TOAST_STATUS_ERROR);
          }
          this.saveLoader = false;
          setTimeout(() => {
            this.route('prior-payroll');
        }, 2000);
        },
        (error) => {
          this.saveLoader = false;
          this._helperService.showToast("Error in saving your pay schedule.", Key.TOAST_STATUS_ERROR);
  
        }
      );

 
}
