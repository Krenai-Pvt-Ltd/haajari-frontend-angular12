import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { StatusKeys } from 'src/app/constant/StatusKeys';
import { EmployeeMonthWiseSalaryData } from 'src/app/models/employee-month-wise-salary-data';
import { StatutoryMonthDeduction } from 'src/app/models/StatutoryMonthDeduction';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { SalaryService } from 'src/app/services/salary.service';

@Component({
  selector: 'app-tds',
  templateUrl: './tds.component.html',
  styleUrls: ['./tds.component.css'],
})
export class TdsComponent implements OnInit {

  
  itemPerPage: number = 10;
  totalItems : number = 0
  pageNumber: number = 1;
  search: string = '';


 readonly StatusKeys = StatusKeys;

 

  private searchSubject = new Subject<boolean>();
  constructor(private _dataService: DataService,
     public _helperService: HelperService,
     private _salaryService :SalaryService) {

       this.searchSubject.pipe(debounceTime(250)) // Wait for 250ms before emitting the value
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
    this.statutoryMonthDeductions = [];
  }

  mainPlaceholderFlag : boolean = false;
  statutoryMonthDeductions: StatutoryMonthDeduction[] = [];
  getEmployeeMonthWiseSalaryDataMethodCall() {
    this.preRuleForShimmersAndErrorPlaceholders();
    this._salaryService.getMonthWiseStatutoryDeduction(this.startDate,this.endDate,this.itemPerPage,this.pageNumber,this.search)
      .subscribe((response) => {
          if (response.object == null || response.object.length ==0) {
            this.dataNotFoundPlaceholder = true;
            this.totalItems = 0;
          } else {
            this.statutoryMonthDeductions = response.object;
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


  size: 'large' | 'small' | 'default' = 'small';
  selectedDate: Date = new Date();
  startDate: string = '';
  endDate: string = '';

  onMonthChange(month: Date): void {
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
    this.getEmployeeMonthWiseSalaryDataMethodCall();
  }



  pageChange(page:any){
    if(  this.pageNumber != page){
      this.pageNumber = page;
      this.getEmployeeMonthWiseSalaryDataMethodCall();
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
        this.getEmployeeMonthWiseSalaryDataMethodCall();
      }

    }else {
      if (this.search.length > 2 && /[a-zA-Z0-9.@]/.test(inp)) {
        this.pageNumber = 1;
        this.getEmployeeMonthWiseSalaryDataMethodCall();

      }else if (event.code == 'Backspace' && (event.target.value.length >= 3)) {
        this.pageNumber = 1;
        this.getEmployeeMonthWiseSalaryDataMethodCall();

      }else if (this.search.length == 0) {
        this.pageNumber = 1;
        this.search = '';
        this.getEmployeeMonthWiseSalaryDataMethodCall();
      }
    }
  }

  resetSearch(){
    this.pageNumber = 1;
    this.totalItems= 0;
    this.search = '';
    this.getEmployeeMonthWiseSalaryDataMethodCall();
  }

}
