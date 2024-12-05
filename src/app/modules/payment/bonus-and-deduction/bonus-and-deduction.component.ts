import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Key } from 'src/app/constant/key';
import { BonusAndDeductionData } from 'src/app/models/bonus-and-deduction-data';
import { EmployeeMonthWiseSalaryData } from 'src/app/models/employee-month-wise-salary-data';
import { StartDateAndEndDate } from 'src/app/models/start-date-and-end-date';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { SalaryService } from 'src/app/services/salary.service';

@Component({
  selector: 'app-bonus-and-deduction',
  templateUrl: './bonus-and-deduction.component.html',
  styleUrls: ['./bonus-and-deduction.component.css'],
})
export class BonusAndDeductionComponent implements OnInit {


  constructor(private dataService: DataService,
              public _helperService: HelperService,
              private _salaryService : SalaryService) {

    
  }

  itemPerPage: number = 8;
  lastPageNumber: number = 0;
  total : number = 0
  pageNumber: number = 1;
  search: string = '';

  readonly PENDING = Key.PENDING;
  readonly APPROVED = Key.APPROVED;

  size: 'small' | 'default' | 'large' = 'default';
  
  isShimmer = false;
  dataNotFoundPlaceholder = false;
  networkConnectionErrorPlaceHolder = false;
  preRuleForShimmersAndErrorPlaceholders() {
    this.isShimmer = true;
    this.dataNotFoundPlaceholder = false;
    this.networkConnectionErrorPlaceHolder = false;
  }



  ngOnInit(): void {
    window.scroll(0, 0);
    this.getFirstAndLastDateOfMonth(this.selectedDate);
  }

 



  onYearChange(date: Date): void {
    this.selectedDate = date;
  }


mainPlaceholderFlag : boolean = false;
bonusAndDeductionDataList: BonusAndDeductionData[] = [];
  getBonusAndDeductionMethodCall() {
    this.preRuleForShimmersAndErrorPlaceholders();
    this._salaryService.getBonusAndDeductionLogs(this.startDate,this.endDate,this.itemPerPage,this.pageNumber,this.search)
      .subscribe(
        (response) => {
          if (response.object == null || response.object.length ==0) {
            this.dataNotFoundPlaceholder = true;
              
          } else {
            this.bonusAndDeductionDataList = response.object;
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

  getFirstAndLastDateOfMonth(selectedDate: Date) {

    this.startDate = this._helperService.formatDateToYYYYMMDD(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    );
    this.endDate = this._helperService.formatDateToYYYYMMDD(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0),
    );
    this.getBonusAndDeductionMethodCall();
    
  }

  

  changePage(page: number | string) {
    if (typeof page === 'number') {
      this.pageNumber = page;
    } else if (page === 'prev' && this.pageNumber > 1) {
      this.pageNumber--;
    } else if (page === 'next' && this.pageNumber < this.totalPages) {
      this.pageNumber++;
    }
    this.getBonusAndDeductionMethodCall();


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
    this.itemPerPage = 10;
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
    this.resetCriteriaFilterMicro();
    this.getBonusAndDeductionMethodCall();
  }

  // Clearing search text
  clearSearch() {
    this.resetCriteriaFilter();
   this.getBonusAndDeductionMethodCall();
  }

  
  selectedDate: Date = new Date();
  startDate: string = '';
  endDate: string = '';

  onMonthChange(month: Date): void {
    this.selectedDate = month;
    this.getFirstAndLastDateOfMonth(this.selectedDate);
  }

  

  bonusEditReq : BonusAndDeductionData = new BonusAndDeductionData();
  @ViewChild('bonusEditButton') bonusEditButton!:ElementRef;
  openEditModal(data: BonusAndDeductionData){
    this.bonusEditReq =  JSON.parse(JSON.stringify(data)) ;   
    this.bonusEditButton.nativeElement.click();
  }



  updateBonus(){
    this._salaryService.updateBonus(this.bonusEditReq).subscribe((response) => {
        if(response.status){
          this.getBonusAndDeductionMethodCall();
          this._helperService.showToast(response.message,Key.TOAST_STATUS_SUCCESS);
        }else{
          this._helperService.showToast(response.message,Key.TOAST_STATUS_ERROR);
        }
      },(error) => {

      }
    );
  }

@ViewChild('bonusDeleteButton') bonusDeleteButton!:ElementRef;
  openDeleteModal(bonusId:number){
    this.bonusId = bonusId;
    this.bonusDeleteButton.nativeElement.click();
  }


  bonusId:number=0;
  deleteBonus(){
    this._salaryService.deleteBonus(this.bonusId).subscribe((response) => {
        if(response.status){
          this.getBonusAndDeductionMethodCall();
          this._helperService.showToast(response.message,Key.TOAST_STATUS_SUCCESS);
        }else{
          this._helperService.showToast(response.message,Key.TOAST_STATUS_ERROR);
        }

      },(error) => {

      }
    );
  }



}