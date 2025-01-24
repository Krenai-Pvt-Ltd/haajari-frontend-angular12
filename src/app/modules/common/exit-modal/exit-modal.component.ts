import { ChangeDetectionStrategy, Component, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Key } from 'src/app/constant/key';
import { UserResignation } from 'src/app/models/UserResignation';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { ModalService } from 'src/app/services/modal.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-exit-modal',
  templateUrl: './exit-modal.component.html',
  styleUrls: ['./exit-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExitModalComponent { 

  @Input() data: any; 
  userId: any;
  ROLE: any;
  constructor(private dataService: DataService, 
    private modalService: ModalService, 
     private fb: FormBuilder, public helperService: HelperService, private activateRoute: ActivatedRoute,
    private ngbModal: NgbModal,
      private roleService: RoleBasedAccessControlService, private afStorage: AngularFireStorage,){
  }

  ngOnInit(): void {
   
    this.userId= this.data.uuid;
    this.getUserResignationInfo();
    // this.startCarousel();
    this.getNoticePeriodDuration();
    const currentYear = new Date().getFullYear();
    this.userId='605076c1-8a1f-11ef-8844-8c8590bb364e';
  }

  userResignationReq: UserResignation = new UserResignation();
  resignationToggle: boolean = false;
  submitResignation() {
    this.resignationToggle = true;
    this.userResignationReq = this.userResignationInfo
    this.dataService.submitResignation(this.userResignationReq).subscribe((res: any) => {
      if (res.status) {
        this.resignationToggle = false
        // this.helperService.resignationSubmitted.next(true);
        this.closeApproveModal.nativeElement.click()
        this.getUserResignationInfo()
        // this.clearForm();
      }
    })

    // console.log('reqs: ',this.userResignationReq)
  }
  userResignationInfo: any;
  discussionType: string = 'Yes'
  recommendDay: string = 'Complete'
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

        console.log('userResignationInfo dashboard : ', this.userResignationInfo)
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
          this.closeApproveModal.nativeElement.click()
          this.approveToggle = false
          this.helperService.profileChangeStatus.next(true);
          this.helperService.showToast(
            res.message,
            Key.TOAST_STATUS_SUCCESS
          );
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

  

}