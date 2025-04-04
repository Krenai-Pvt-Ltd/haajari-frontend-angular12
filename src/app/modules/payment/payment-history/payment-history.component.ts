import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import saveAs from 'file-saver';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { Routes } from 'src/app/constant/Routes';
import { StatusKeys } from 'src/app/constant/StatusKeys';
import { EmployeeMonthWiseSalaryData } from 'src/app/models/employee-month-wise-salary-data';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollService } from 'src/app/services/payroll.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
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
  readonly Routes=Routes;

  private searchSubject = new Subject<boolean>();

  constructor(
    private _salaryService: SalaryService,
    private _payrollService : PayrollService,
     public _helperService: HelperService,
      public rbacService: RoleBasedAccessControlService,
      private http: HttpClient) {

         this.searchSubject
                  .pipe(debounceTime(250)) // Wait for 250ms before emitting the value
                  .subscribe(searchText => {
                    this.searchByInput(searchText);
                  });

  }

  ngOnInit(): void {
    window.scroll(0, 0);
    this.getFirstAndLastDateOfMonth(this.selectedDate);
  }


  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceHolder = false;
  preRuleForShimmersAndErrorPlaceholders() {
    this.isShimmer = true;
    this.dataNotFoundPlaceholder = false;
    this.networkConnectionErrorPlaceHolder = false;
    this.employeeMonthWiseSalaryDataList  = [];
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
            this.totalItems = 0;
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


  searchDebounce(event:any){
    this.searchSubject.next(event)
  }

  searchByInput(event: any) {
    // this.isBeingSearch = true;
    var inp = String.fromCharCode(event.keyCode);
    if (event.type == 'paste') {
      let pastedText = event.clipboardData.getData('text');
      if (pastedText.length > 2) {
        this.pageNumber = 1;
        this.getMonthWiseSalarySlipData();
      }

    }else {
      if (this.search.length > 2 && /[a-zA-Z0-9.@]/.test(inp)) {
        this.pageNumber = 1;
        this.getMonthWiseSalarySlipData();

      }else if (event.code == 'Backspace' && (event.target.value.length >= 3)) {
        this.pageNumber = 1;
        this.getMonthWiseSalarySlipData();

      }else if (this.search.length == 0) {
        this.pageNumber = 1;
        this.search = '';
        this.getMonthWiseSalarySlipData();
      }
    }
  }

  resetSearch(){
    this.pageNumber = 1;
    this.totalItems= 0;
    this.search = '';
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
    if(!this.rbacService.hasWriteAccess(this.Routes.PAYMENTHISTORY)){
      this._helperService.showPrivilegeErrorToast();
      return;
    }
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




  togglePayslipStatus( data: EmployeeMonthWiseSalaryData){
    if(!this.rbacService.hasWriteAccess(this.Routes.PAYMENTHISTORY)){
      this._helperService.showPrivilegeErrorToast();
      return;
    }
    var ids : number[]= [];
    ids.push(data.id);
    this._salaryService.updateSalarySlipStatus(ids).subscribe(
      (response) => {
        if(response.status){
          data.isSlipHold = data.isSlipHold == 1? 0: 1;
          this._helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
        }else{
          data.isSlipHold = data.isSlipHold == 0? 1: 0;
          this._helperService.showToast(response.message, Key.TOAST_STATUS_ERROR);
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




  isAll:number=1;
  processing:boolean=false;
  generatePayslip(){
    this.processing=true;
    if(this.monthWiseIds.length>0){
      this.isAll = 0;
    }
    this._salaryService.generatePaySlip(this.startDate, this.endDate,this.monthWiseIds,this.isAll).subscribe(
      (response) => {
        if(response.status){
          this.monthWiseIds =[];
          this.getMonthWiseSalarySlipData();
          this._helperService.showToast('Payslip generated Successfully', Key.TOAST_STATUS_SUCCESS);
        }else{
          //TODOD: temporray
          this._helperService.showToast('Payslip generated Successfully', Key.TOAST_STATUS_SUCCESS);

          // this._helperService.showToast('Failed to generate pay slip', Key.TOAST_STATUS_ERROR);
        }
        this.processing=false;
      },
      (error) => {
        this.processing=false;
      }
    );
  }



  downloading:boolean=false;
  downloadBankReport(){
    this.downloading=true;
    this._payrollService.getPayrollBankReport(this.startDate, this.endDate).subscribe(
      (response) => {
        if(response.status){
          const downloadLink = document.createElement('a');
          downloadLink.href = response.object;
          downloadLink.download = 'payroll_bank_report.xlsx';
          downloadLink.click();
        }else{
          this._helperService.showToast('Bank Detail Not Found', Key.TOAST_STATUS_ERROR);
        }
        this.downloading=false;
      },
      (error) => {
        this.downloading=false;
      }
    );
  }



}
