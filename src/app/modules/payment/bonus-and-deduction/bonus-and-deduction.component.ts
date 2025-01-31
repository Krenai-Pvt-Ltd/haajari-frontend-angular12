import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { BonusAndDeductionData } from 'src/app/models/bonus-and-deduction-data';
import { HelperService } from 'src/app/services/helper.service';
import { SalaryService } from 'src/app/services/salary.service';

@Component({
  selector: 'app-bonus-and-deduction',
  templateUrl: './bonus-and-deduction.component.html',
  styleUrls: ['./bonus-and-deduction.component.css'],
})
export class BonusAndDeductionComponent implements OnInit {


  constructor(public _helperService: HelperService,
              private _salaryService : SalaryService) {
  }

  itemPerPage: number = 10;
  totalItems : number = 0
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
    this.bonusAndDeductionDataList = [];
    this.totalItems = 0;
  }

  ngOnInit(): void {
    window.scroll(0, 0);
    this.getFirstAndLastDateOfMonth(this.selectedDate);
  }


mainPlaceholderFlag : boolean = false;
bonusAndDeductionDataList: BonusAndDeductionData[] = [];
  getBonusAndDeductionMethodCall() {
    this.preRuleForShimmersAndErrorPlaceholders();
    this._salaryService.getBonusAndDeductionLogs(this.startDate,this.endDate,this.itemPerPage,this.pageNumber,this.search)
      .subscribe((response) => {
          if (response.object == null || response.object.length ==0) {
            this.dataNotFoundPlaceholder = true;
          } else {
            this.bonusAndDeductionDataList = response.object;
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

  getFirstAndLastDateOfMonth(selectedDate: Date) {

    this.startDate = this._helperService.formatDateToYYYYMMDD(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    );
    this.endDate = this._helperService.formatDateToYYYYMMDD(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0),
    );
    this.getBonusAndDeductionMethodCall();

  }

  pageChange(page:any){
    if(page != this.pageNumber){
      this.pageNumber = page; 
      this.getBonusAndDeductionMethodCall();
    }

  }

  startIndex(): number {
    return (this.pageNumber - 1) * this.itemPerPage + 1;
  }

  lastIndex(): number {
    return Math.min(this.pageNumber * this.itemPerPage, this.totalItems);
  }



  resetCriteriaFilter() {
    this.itemPerPage = 5;
    this.pageNumber = 1;
    this.search = '';
  }

  resetCriteriaFilterMicro() {
    this.itemPerPage = 5;
    this.pageNumber = 1;
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
  startDate: string='';
  endDate: string='';

  onMonthChange(): void { 
    if(this.selectedDate.getMonth() == new Date(this.startDate).getMonth()){
      return;
    }
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
