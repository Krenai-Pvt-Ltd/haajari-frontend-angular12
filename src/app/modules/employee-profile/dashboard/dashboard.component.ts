import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  requestModal: boolean = false;
  
  constructor(private roleService: RoleBasedAccessControlService, private dataService: DataService, public helperService: HelperService) { }

  userId: string =''
  ngOnInit(): void {
    const userUuidParam = new URLSearchParams(window.location.search).get('userId');
    this.userId = userUuidParam?.toString() ?? ''

    this.getRole();
    this.getUserResignationInfo();

  }

  ROLE: any;
  async getRole(){
    this.ROLE = await this.roleService.getRole();
  }

  userResignationInfo: any;
  discussionType: string = 'Yes'
  recommendDay: string = 'Complete'
  getUserResignationInfo(){
    this.userResignationInfo = []
    this.dataService.getUserResignationInfo(this.userId).subscribe((res: any) => {
      if(res.status){
        this.userResignationInfo = res.object[0]

        if(this.userResignationInfo.isManagerDiscussion == 0){
          this.discussionType = 'No'
        }

        if(this.userResignationInfo.isRecommendedLastDay == 1){
          this.recommendDay = 'Other'
        }

        console.log('userResignationInfo dashboard : ',this.userResignationInfo)
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
      if(res.status){
        this.closeApproveModal.nativeElement.click()
        this.approveToggle = false
        this.helperService.profileChangeStatus.next(true);
        this.helperService.showToast(
          res.message,
          Key.TOAST_STATUS_SUCCESS
        );
      }else{
        this.approveToggle = false;
      }
    })

  }

}
