import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import saveAs from 'file-saver';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { StatusKeys } from 'src/app/constant/StatusKeys';
import { EmployeeMonthWiseSalaryData } from 'src/app/models/employee-month-wise-salary-data';
import { HelperService } from 'src/app/services/helper.service';
import { SalaryService } from 'src/app/services/salary.service';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css'],
})
export class PaymentHistoryComponent implements OnInit {


  itemPerPage: number = 10;
  totalItems : number = 0
  pageNumber: number = 1;
  search: string = '';

  count : number=0;
  monthWiseIds:number[] = new Array();
  allChecked : boolean =false;

  readonly constant = constant;
  readonly StatusKeys = StatusKeys;


  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceHolder = false;
  preRuleForShimmersAndErrorPlaceholders() {
    this.isShimmer = true;
    this.dataNotFoundPlaceholder = false;
    this.networkConnectionErrorPlaceHolder = false;
    this.employeeMonthWiseSalaryDataList  = [];
  }

  constructor(
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

  onMonthChange(): void {
    if(this.selectedDate.getMonth() == new Date(this.startDate).getMonth()){
      return;
    }
    this.getFirstAndLastDateOfMonth(this.selectedDate);
  }



  getFirstAndLastDateOfMonth(selectedDate: Date) {

    this.startDate = this._helperService.formatDateToYYYYMMDD(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    );
    this.endDate = this._helperService.formatDateToYYYYMMDD(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0),
    );
    this.getMonthWiseSalarySlipData();
  }


  mainPlaceholderFlag : boolean = false;

  employeeMonthWiseSalaryDataList: EmployeeMonthWiseSalaryData[] = [];
  getMonthWiseSalarySlipData() {
    this.preRuleForShimmersAndErrorPlaceholders();
    this._salaryService.getMonthWiseSalarySlipData(this.startDate,this.endDate,this.itemPerPage,this.pageNumber,this.search)
      .subscribe((response) => {
          if (response.object == null || response.object.length == 0) {
            this.dataNotFoundPlaceholder = true;
          } else {
            this.employeeMonthWiseSalaryDataList = response.object;
            this.totalItems = response.totalItems;
          }
          this.isShimmer = false;
        },
        (error) => {
          this.isShimmer = false;
          this.networkConnectionErrorPlaceHolder = true;
        }
      );
  }


  pageChange(page:any){
    if(  this.pageNumber != page){
      this.pageNumber = page;
      this.getMonthWiseSalarySlipData();
    }

  }


  startIndex(): number {
    return (this.pageNumber - 1) * this.itemPerPage + 1;
  }

  lastIndex(): number {
    return Math.min(this.pageNumber * this.itemPerPage, this.totalItems);
  }


  resetCriteriaFilter() {
    this.pageNumber = 1;
    this.totalItems = 0;
    this.search = '';
  }

  resetCriteriaFilterMicro() {
    this.pageNumber = 1;
    this.totalItems = 0;
  }

  searchUsers(event: Event) {
    this._helperService.ignoreKeysDuringSearch(event);
    this.pageNumber = 1;
    this.totalItems = 0;
    this.getMonthWiseSalarySlipData();
  }

  // Clearing search text
  clearSearch() {
    this.resetCriteriaFilter();
   this.getMonthWiseSalarySlipData();
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

  togglePayslipStatus(monthId:number){
    this.monthWiseIds = [];
    this.monthWiseIds.push(monthId);
    this.updatePaySlipStatus();

  }


  updatePaySlipStatus(){
    this._salaryService.updateSalarySlipStatus(this.monthWiseIds).subscribe(
      (response) => {
        if(response.status){
          this.getMonthWiseSalarySlipData();
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
    this.sharePayslipVia(shareVia);
  }


  sharePayslipVia(shareVia: string) {
    this.shareIds = this.monthWiseIds;
    this._salaryService.shareSalaryPayslipVia(this.shareIds,shareVia).subscribe(
      (response) => {
        if(response.status){
          this._helperService.showToast("Payslip shared successfully", Key.TOAST_STATUS_SUCCESS);
        }
      },
      (error) => {

      }
    );
  }




  generateSalarySlipMethodCall(){
    this._salaryService.generatePaySlip(this.startDate, this.endDate).subscribe(
      (response) => {
        if(response.status){
          this._helperService.showToast('Payslip generated Succesfully', Key.TOAST_STATUS_SUCCESS)
          this.getMonthWiseSalarySlipData();
        }else{
          this._helperService.showToast('Failed to generate pay slip', Key.TOAST_STATUS_ERROR)
        }
      },
      (error) => {
    
      }
    );
  }



}
