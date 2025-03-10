import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { LeaveResponse } from 'src/app/models/leave-responses.model';
import { HelperService } from 'src/app/services/helper.service';
import { LeaveService } from 'src/app/services/leave.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-leave-request',
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaveRequestComponent implements OnInit {

  constructor(
    private leaveService: LeaveService,
    private helperService: HelperService,
    private rbacService: RoleBasedAccessControlService,
    private cdr: ChangeDetectorRef
  ) { }

  ROLE: any = '';
    @Input() data: any; // Existing input for passing data
    @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();
    @Output() notFetching: EventEmitter<void> = new EventEmitter<void>();
    sendBulkDataToComponent() {
      this.closeModal.emit(this.userLeaveQuota);
    }


    isModal: boolean = true;
  ngOnInit(): void {
    
    this.ROLE = this.rbacService.userInfo.role;
    if(this.data.leave) {
      this.leave = this.data.leave;
    }
    if(this.data.id){
      this.fetchLeaveById(this.data.id);
    }
    if(this.data.isModal==0){
      this.isModal = false;
    }
  }

  isLeaveLoading: boolean = false;
  fetchLeaveById(id: number) {
    this.isLeaveLoading = true;
    this.leaveService.getLeaveById(id).subscribe(
      (response) => {
        if(response.status) {
          this.isLeaveLoading = false;
          this.leave = response.object;
          this.cdr.detectChanges();
          this.cdr.markForCheck();
        }else{
          this.notFetching.emit();
          this.isLeaveLoading = false;
        }
      },
      (error) => {
        this.notFetching.emit();
        console.error('Error fetching leave:', error);
      }
    );
  }

  APPROVED: string = 'approved';
  PENDING: string = 'pending';
  REJECTED: string = 'rejected';
  HISTORY: string = 'history';
  REQUESTED: string = 'requested';
  logInUserUuid: string = '';

  leave!: LeaveResponse;
        viewLeave(leave:any){
          this.leave = leave;

        }

        imageError: boolean = false;


        handleImageError() {
          this.imageError = true;
        }

        openInNewTab(url: string) {
          window.open(url, '_blank');
        }


        @ViewChild("closebutton") closebutton!:ElementRef;
        rejectionReason: string = '';
        isLoading: boolean = false;
        rejectionReasonFlag: boolean = false;
        rejectLoading: boolean = false;
        LEAVE_QUOTA_EXCEEDED = Key.LEAVE_QUOTA_EXCEEDED;
       showLeaveQuotaModal: boolean = false;
        userLeaveQuota: any = null;
        approveOrRejectLeave(leaveId: number, operationString: string) {
          debugger
          if (operationString === this.REJECTED ) {
            this.rejectLoading= true;
          }else{
            this.isLoading = true;
          }
          this.leaveService.approveOrRejectLeaveOfUser(leaveId, operationString, this.rejectionReason).subscribe({
            next: (response: any) => {
              this.rejectLoading= false;
              this.isLoading = false;
              this.rejectionReason = '';
              this.rejectionReasonFlag = false;
             // this.getLeaves(true);

              if(this.closebutton){
                this.closebutton.nativeElement.click();
              }

              this.cdr.detectChanges();
              this.cdr.markForCheck();
              // this.helperService.showToast(`Leave ${operationString} successfully.`, Key.TOAST_STATUS_SUCCESS);
              if (response.message === 'approved' || response.message === 'rejected') {
                this.leave.status = operationString;
                this.helperService.showToast(`Leave ${operationString} successfully.`, Key.TOAST_STATUS_SUCCESS);
                this.sendBulkDataToComponent();
              } else if (response.message === this.LEAVE_QUOTA_EXCEEDED) {
                this.helperService.showToast('Leave quota exceeded.', Key.TOAST_STATUS_ERROR);
                this.fetchUserLeaveQuota(leaveId); // Fetch and open leave quota modal
              } else {
                this.helperService.showToast(response.message, Key.TOAST_STATUS_ERROR);
                this.sendBulkDataToComponent();
              }

            },
            error: (error) => {
              this.helperService.showToast('Error.', Key.TOAST_STATUS_ERROR);
              console.error('Failed to fetch approve/reject leaves:', error);
              this.isLoading = false;
              this.rejectLoading= false;
            },
          });
        }



            // Fetch user leave quota details
            fetchUserLeaveQuota(leaveId: number) {
              this.leaveService.getUserLeaveQuota(leaveId).subscribe({
                next: (quota: any) => {
                  this.userLeaveQuota = quota.object; // Assign quota details
                  this.sendBulkDataToComponent();
                },
                error: (err) => {
                  console.error('Failed to fetch user leave quota:', err);
                  this.helperService.showToast('Failed to load leave quota.', Key.TOAST_STATUS_ERROR);
                }
              });
            }

            // // Open modal
            // openLeaveQuotaModal() {
            //   this.showLeaveQuotaModal = true;
            // }

            // // Close modal
            // closeLeaveQuotaModal() {
            //   this.showLeaveQuotaModal = false;
            // }

        approveOrRejectLeaveCall(leaveId: number, operationString: string) {
          debugger
           if(operationString === this.APPROVED) {
            this.rejectionReasonFlag = false;
            this.rejectionReason = '';
            this.approveOrRejectLeave(leaveId, operationString);
           }else if (operationString === this.REJECTED) {
            this.rejectionReasonFlag = true;
            // this.approveOrRejectLeave(leaveId, operationString);
           }
        }

}
