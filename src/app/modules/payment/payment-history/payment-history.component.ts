import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { debug } from 'console';
import * as saveAs from 'file-saver';
import * as moment from 'moment';
import { Key } from 'src/app/constant/key';
import { EmployeeMonthWiseSalaryData } from 'src/app/models/employee-month-wise-salary-data';
import { StartDateAndEndDate } from 'src/app/models/start-date-and-end-date';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollService } from 'src/app/services/payroll.service';
import { SalaryService } from 'src/app/services/salary.service';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css'],
})
export class PaymentHistoryComponent implements OnInit {


  itemPerPage: number = 8;
  lastPageNumber: number = 0;
  total : number = 0
  pageNumber: number = 1;
  search: string = '';

  count : number=0;
  monthWiseIds:number[] = new Array();
  allChecked : boolean =false;

  readonly PENDING = Key.PENDING;
  readonly APPROVED = Key.APPROVED;


  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceHolder = false;
  preRuleForShimmersAndErrorPlaceholders() {
    this.isShimmer = true;
    this.dataNotFoundPlaceholder = false;
    this.networkConnectionErrorPlaceHolder = false;
  }

  constructor(private _dataService: DataService,
    private _salaryService: SalaryService,
     public _helperService: HelperService,
      private http: HttpClient) {
    
  }

  ngOnInit(): void {
    window.scroll(0, 0);
    this.getFirstAndLastDateOfMonth(this.selectedDate);
  }


  size: 'large' | 'small' | 'default' = 'small';
  selectedDate: Date = new Date();
  startDate: string = '';
  endDate: string = '';

  onMonthChange(month: Date): void {
    this.selectedDate = month;
    this.getFirstAndLastDateOfMonth(this.selectedDate);
  }



  getFirstAndLastDateOfMonth(selectedDate: Date) {

    this.startDate = this._helperService.formatDateToYYYYMMDD(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    );
    this.endDate = this._helperService.formatDateToYYYYMMDD(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0),
    );
    this.getOrganizationMonthWiseSalaryDataMethodCall();
  }

  
  mainPlaceholderFlag : boolean = false;

  employeeMonthWiseSalaryDataList: EmployeeMonthWiseSalaryData[] = [];
  getOrganizationMonthWiseSalaryDataMethodCall() {
    this.preRuleForShimmersAndErrorPlaceholders();
    this._salaryService.getMonthWiseSalarySlipData(this.startDate,this.endDate,this.itemPerPage,this.pageNumber,this.search)
      .subscribe((response) => {
          if (response.object == null || response.object.length == 0) {
            this.dataNotFoundPlaceholder = true;
          } else {
            this.employeeMonthWiseSalaryDataList = response.object;
            this.total = response.totalItems;
            this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
          }
          this.isShimmer = false;
        },
        (error) => {
          this.isShimmer = false;
          this.networkConnectionErrorPlaceHolder = true;
        }
      );
  }

  changePage(page: number | string) {
    if (typeof page === 'number') {
      this.pageNumber = page;
    } else if (page === 'prev' && this.pageNumber > 1) {
      this.pageNumber--;
    } else if (page === 'next' && this.pageNumber < this.totalPages) {
      this.pageNumber++;
    }
    this.getOrganizationMonthWiseSalaryDataMethodCall();


  }

  getPages(): number[] {
    const totalPages = Math.ceil(this.total / this.itemPerPage);
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.itemPerPage);
  }
  getStartIndex(): number {
    return (this.pageNumber - 1) * this.itemPerPage + 1;
  }
  getEndIndex(): number {
    const endIndex = this.pageNumber * this.itemPerPage;
    return endIndex > this.total ? this.total : endIndex;
  }

  resetCriteriaFilter() {
    this.itemPerPage = 8;
    this.pageNumber = 1;
    this.lastPageNumber = 0;
    this.total = 0;
    this.search = '';
  }

  resetCriteriaFilterMicro() {
    this.itemPerPage = 8;
    this.pageNumber = 1;
    this.lastPageNumber = 0;
    this.total = 0;
  }

  searchUsers(event: Event) {
    this._helperService.ignoreKeysDuringSearch(event);
    this.itemPerPage = 8;
    this.pageNumber = 1;
    this.lastPageNumber = 0;
    this.total = 0;
    this.getOrganizationMonthWiseSalaryDataMethodCall();
  }

  // Clearing search text
  clearSearch() {
    this.resetCriteriaFilter();
   this.getOrganizationMonthWiseSalaryDataMethodCall();
  }

  


  unSelectAll(){
    this.count=0;
    this.allChecked = false;
    this.monthWiseIds = [];
    this.employeeMonthWiseSalaryDataList.map((element) => {
      element.checked = false;
    })
  }

  selectAll() {
    if (this.allChecked) {
      this.employeeMonthWiseSalaryDataList.forEach((element) => {
        element.checked = false;
        this.count--;
        var index = this.monthWiseIds.findIndex(x=>x==element.id);
        if(index>-1){
          this.monthWiseIds.splice(index,1);
        }
      })
    }
    else {
      this.employeeMonthWiseSalaryDataList.forEach((element) => {
        this.monthWiseIds.push(element.id);
        element.checked = true;
        this.count++;
      })
    }
    this.allChecked = !this.allChecked;
  }

 
  selectSingle(event: any, i: any) {
    if (event.checked) {
      this.employeeMonthWiseSalaryDataList[i].checked = false;
      this.count--;
      var index = this.monthWiseIds.findIndex(x=>x==this.employeeMonthWiseSalaryDataList[i].id);
      if(index>-1){
        this.monthWiseIds.splice(index,1);
      }
      this.allChecked = false;
    }
    else {
      this.count++;
      this.employeeMonthWiseSalaryDataList[i].checked = true;
      this.monthWiseIds.push(this.employeeMonthWiseSalaryDataList[i].id);
      if (this.count == this.employeeMonthWiseSalaryDataList.length) {
        this.allChecked = true;
      }
    }
  }

  
  updateSalarySlipStatus(){
    this._salaryService.updateSalarySlipStatus(this.monthWiseIds).subscribe(
      (response) => {
        if(response.status){
          this.getOrganizationMonthWiseSalaryDataMethodCall();
          this._helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
        }
      },(error) => {
       
      }
    );
  }
  
  downloadPdf(url: string) {
    this.http.get(url, { responseType: 'blob' }).subscribe(blob => {
      saveAs(blob, 'Salary_PaySlip.pdf');
    });
  }

  viewPdf(url: string) {
    window.open(url, '_blank');
  }

  shareIds:number[] = [];
  shareIndividualPayslip(shareVia: string,id:number){
    this.shareIds =[];
    this.shareIds.push(id);
    this.shareSalaryPayslipVia(shareVia);
  }


  shareSalaryPayslipVia(shareVia: string) {
    this.shareIds = this.monthWiseIds;
    this._salaryService.shareSalaryPayslipVia(this.shareIds,shareVia).subscribe(
      (response) => {
        if(response.status){
          this._helperService.showToast("Payslip sent successfully", Key.TOAST_STATUS_SUCCESS);
        }
      },
      (error) => {
       
      }
    );
  }

  // generateSalarySlipMethodCall(){
  //   this.dataService.generateSalarySlip(this.startDate, this.endDate,this.selectedEmployeeIds).subscribe(
  //     (response) => {
        
  //       this.isAllUsersSelected = false;
  //       this.selectedEmployeeIds= [];
  //       this.helperService.showToast('Payslip generated Succesfully', Key.TOAST_STATUS_SUCCESS)
  //       this.getOrganizationMonthWiseSalaryDataMethodCall();
  //     },
  //     (error) => {
  //       console.log(error);
  //     }
  //   );
  // }
  
  
}
