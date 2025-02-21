import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { UserResignation } from 'src/app/models/UserResignation';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-exit-modal',
  templateUrl: './exit-modal.component.html',
  styleUrls: ['./exit-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExitModalComponent {

  @Input() data: any;
  userId: any;
  id: any;
  ROLE: any= '';
  isModal: boolean = true;
  userResignationReq: UserResignation = new UserResignation();
  resignationToggle: boolean = false;
  userResignationInfo: any;
  discussionType: string = 'Yes'
  recommendDay: string = 'Complete'
  @Output() closeEvent: EventEmitter<void> = new EventEmitter<void>();

  constructor(private dataService: DataService, private cdr: ChangeDetectorRef,
    public helperService: HelperService){
  }

  close() {
    this.closeEvent.emit();
  }

  ngOnInit(): void {
    this.fetchData();
    

  }

ngOnChanges(changes: SimpleChanges) {
      if (changes['data']) {
       this.fetchData();
      }
    }


    fetchData(){
      this.userId= this.data.uuid;
    this.id= this.data.id;
    if(this.data.id){
      this.getUserResignationInfoById();
    }else{
    this.getUserResignationInfo();
    this.getNoticePeriodDuration();
    }
    if(this.data.isModal==0){
      this.isModal= false;
    }

    // this.startCarousel();
    this.ROLE= this.data.userType;
    }
/**
 * Method to handle the submission of a resignation request.
 *
 * This method performs the following steps:
 * 1. Sets the `resignationToggle` flag to `true` to indicate that the resignation process has started.
 * 2. Assigns the current user resignation information to the request object (`userResignationReq`).
 * 3. Sends the resignation request to the server using the `dataService.submitResignation()` method.
 * 4. Handles the server's response:
 *    - If the response status indicates success (`res.status`):
 *      - Resets the `resignationToggle` flag to `false`.
 *      - Closes the approval modal via a native element reference.
 *      - Refreshes the user's resignation information by calling `getUserResignationInfo()`.
 *      - Closes the modal (additional logic for this may be implemented in the `close()` method).
 *   - If the response status indicates failure:
 *     - Resets the `resignationToggle` flag to `false`.
 */
  submitResignation() {
    this.resignationToggle = true;
    this.userResignationReq = this.userResignationInfo
    this.dataService.submitResignation(this.userResignationReq).subscribe((res: any) => {
      if (res.status) {
        this.resignationToggle = false
        this.closeApproveModal.nativeElement.click()
        this.getUserResignationInfo()
        // this.clearForm();
        this.close();
      }
    })
  }

  getUserResignationInfo() {
    this.userResignationInfo = []
    this.dataService.getUserResignationInfo(this.userId).subscribe((res: any) => {
      if (res.status) {
        this.userResignationInfo = res.object[0]

        if (this.userResignationInfo.isManagerDiscussion == 0) {
          this.discussionType = 'No'
        }

        if (this.userResignationInfo.isRecommendedLastDay == 1) {
          this.recommendDay = 'Other'
        }
        this.cdr.detectChanges();
        console.log('userResignationInfo dashboard : ', this.userResignationInfo)
      }
    })
  }

  isLoading: boolean = false;
  getUserResignationInfoById() {
    this.isLoading = true;
    this.userResignationInfo = []
    this.dataService.getUserResignationInfoById(this.id).subscribe((res: any) => {
      if (res.status) {
        this.userResignationInfo = res.object[0]
        this.userId= this.userResignationInfo.uuid;
        this.getNoticePeriodDuration();
        if (this.userResignationInfo.isManagerDiscussion == 0) {
          this.discussionType = 'No'
        }
        this.isLoading = false;
        if (this.userResignationInfo.isRecommendedLastDay == 1) {
          this.recommendDay = 'Other'
        }
        this.cdr.detectChanges();
        console.log('userResignationInfo dashboard : ', this.userResignationInfo)
      }else{
        this.close();
      }

    })
  }

    @ViewChild('closeApproveModal') closeApproveModal!: ElementRef
    approveToggle: boolean = false
    hideResignationModal: boolean = false;
    approveOrDenyResignation(id: number) {

      debugger
      this.approveToggle = true;
      this.hideResignationModal = true;

      this.dataService.updateResignation(id).subscribe((res: any) => {
        if (res.status) {
          this.approveToggle = false
          this.helperService.profileChangeStatus.next(true);
          this.helperService.showToast(
            res.message,
            Key.TOAST_STATUS_SUCCESS
          );

          this.close();
          if(this.closeApproveModal){
            this.closeApproveModal.nativeElement.click()
          }
        } else {
          this.approveToggle = false;
        }
      })
    }

    selectManagerDiscussion(value: string): void {
      this.userResignationInfo.isManagerDiscussion = value == 'Yes' ? 1 : 0
    }


    selectRecommendDay(value: string): void {

      // this.userResignationInfo.userLastWorkingDay = ''

      this.userResignationInfo.isRecommendLastDay = value == 'Other' ? 1 : 0

      if (this.userResignationInfo.isRecommendLastDay == 0) {
        this.userResignationInfo.userLastWorkingDay = ''
        this.calculateLasWorkingDay();
      } else {
        this.userResignationInfo.userLastWorkingDay = this.userResignationInfo.userLastWorkingDay
      }
    }

    calculateLasWorkingDay() {
      const today = new Date();
      // const maxDate = new Date();
      const maxDate = new Date();
      maxDate.setDate(today.getDate() + this.noticePeriodDuration); // Add 45 days to today's date

      // this.lastWorkingDay = maxDate;
      // this.userResignationReq.lastWorkingDay = maxDate
      this.userResignationInfo.userLastWorkingDay = this.helperService.formatDateToYYYYMMDD(maxDate);
      // console.log("Max Date: ", this.lastWorkingDay);
    }

    noticePeriodDuration: number = 0;
    getNoticePeriodDuration() {
    this.dataService.getNoticePeriodDuration(this.userId).subscribe((res: any) => {
      if (res.status) {
        this.noticePeriodDuration = res.object
      }
    })
  }

  showRevokeDiv: boolean = false;
  revokeReason: string = ''
  requestModal: boolean = false;
  revokeResignation(id: number) {

    if (!this.showRevokeDiv) {
      this.showRevokeDiv = true;
    } else {
      this.approveToggle = true;
      this.requestModal = true;
      // console.log('hitt')
      // this.approveToggle = false
      // this.closeApproveModal.nativeElement.click()
      this.dataService.revokeResignation(id, this.userResignationInfo.revokeReason).subscribe((res: any) => {
        if (res.status) {
          this.closeApproveModal.nativeElement.click()
          this.approveToggle = false
          // this.helperService.profileChangeStatus.next(true);
          this.helperService.showToast(
            res.message,
            Key.TOAST_STATUS_SUCCESS
          );
        } else {
          this.approveToggle = false;
        }
      })

    }

  }

  clearForm() {
    this.userResignationInfo = this.userResignationInfo;
    this.revokeReason = ''
    this.userResignationInfo.revokeReason = ''
    this.showRevokeDiv = false;
  }

  disableAction(){
   var isDisabled=  this.ROLE== 'ADMIN'? true : null
    return isDisabled;
  }

}
