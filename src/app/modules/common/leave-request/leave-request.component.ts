import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
  ) { }

  ROLE: any = '';
   @Input() data: any; // Existing input for passing data
    @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
  ngOnInit(): void {
    this.ROLE = this.rbacService.userInfo.role;
    this.leave = this.data.leave;
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
        approveOrRejectLeave(leaveId: number, operationString: string) {
          debugger
          this.isLoading = true;
          this.leaveService.approveOrRejectLeaveOfUser(leaveId, operationString, this.rejectionReason).subscribe({
            next: (response: any) => {

              this.isLoading = false;
              this.rejectionReason = '';
              this.rejectionReasonFlag = false;
             // this.getLeaves(true);
              this.closebutton.nativeElement.click();
              this.helperService.showToast(`Leave ${operationString} successfully.`, Key.TOAST_STATUS_SUCCESS);
            },
            error: (error) => {
              this.helperService.showToast('Error.', Key.TOAST_STATUS_ERROR);
              console.error('Failed to fetch approve/reject leaves:', error);
              this.isLoading = false;
            },
          });
        }

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
