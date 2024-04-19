import { Component, OnInit } from '@angular/core';
import { MonthResponse } from 'src/app/models/month-response';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-payroll-dashboard',
  templateUrl: './payroll-dashboard.component.html',
  styleUrls: ['./payroll-dashboard.component.css']
})
export class PayrollDashboardComponent implements OnInit {

  constructor(private dataService : DataService, private helperService : HelperService) { }

  ngOnInit(): void {
    this.getOrganizationRegistrationDateMethodCall();
    this.getMonthResponseList(this.selectedDate);
  }


  size: 'large' | 'small' | 'default' = 'small';
  selectedDate: Date = new Date();
  startDate : string = '';
  endDate : string = '';

  onYearChange(year: Date): void {
    console.log("Month is getting selected!");
    this.selectedDate = year;
    this.getMonthResponseList(this.selectedDate);
    // this.getFirstAndLastDateOfMonth(this.selectedDate);
  }

  getFirstAndLastDateOfMonth(selectedDate : Date){
    this.startDate = this.helperService.formatDateToYYYYMMDD(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    this.endDate = this.helperService.formatDateToYYYYMMDD(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0));
  }
  
  disableYears = (date: Date): boolean => {
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();
    const organizationRegistrationYear = new Date(this.organizationRegistrationDate).getFullYear();
    const organizationRegistrationMonth = new Date(this.organizationRegistrationDate).getMonth();

    // Disable if the year is before the organization registration year or if the year is after the organization registration year
    if (dateYear < organizationRegistrationYear || dateYear > currentYear) {
      return true;
    }
  
    return false;
  };

  organizationRegistrationDate : string = '';
  getOrganizationRegistrationDateMethodCall(){
    debugger
    this.dataService.getOrganizationRegistrationDate().subscribe((response) => {
      this.organizationRegistrationDate = response;
    }, ((error) =>{
      console.log(error);
    }))
  }

  monthResponseList : MonthResponse[] = [];
  getMonthResponseList(date : Date){
    this.monthResponseList = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < 12; i++) {
      date.setMonth(i);
      const monthName = date.toLocaleString('default', { month: 'long' });
      const status = i < currentMonth || date.getFullYear() < currentYear ? 'Completed' : i === currentMonth ? 'Current' : 'Upcoming';

      this.monthResponseList.push(new MonthResponse(i + 1, monthName, currentYear, status));
    }
  }


}
