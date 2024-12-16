import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Key } from 'src/app/constant/key';
import { UserResignation } from 'src/app/models/UserResignation';
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
  usersWithUpcomingBirthdays: any;

  resignationSubmittedSubscriber: any;
  resignationSubmittedToggle: boolean = false;
  constructor(private roleService: RoleBasedAccessControlService, private dataService: DataService, public helperService: HelperService) { 
    this.resignationSubmittedSubscriber =  this.helperService.resignationSubmitted.subscribe((value)=>{
      if(value){
        this.resignationSubmittedToggle = true;
        this.getUserResignationInfo();
      }else{
        this.resignationSubmittedToggle = false;
      }
    });
  }

  ngOnDestroy(){
    this.resignationSubmittedSubscriber.complete();
  }

  userId: string =''
  ngOnInit(): void {
    const userUuidParam = new URLSearchParams(window.location.search).get('userId');
    this.userId = userUuidParam?.toString() ?? ''

    this.getRole();
    this.getUserResignationInfo();
    this.getUsersWithUpcomingBirthdays();
    this.getNewUsersJoinies();
    this.getUsersUpcomingWorkAnniversaries();
    this.getNoticePeriodDuration()

  }





getUsersWithUpcomingBirthdays(): void {
  this.dataService.getUsersWithUpcomingBirthdays().subscribe(
    (data) => {
      this.usersWithUpcomingBirthdays = data;
    },
    (error) => {
      console.error('Error fetching upcoming birthdays:', error);
    }
  );
}
anniversaries: any;
getUsersUpcomingWorkAnniversaries(): void {
  this.dataService.getRecentlyWorkAnniversary().subscribe(
    (data) => {
      this.anniversaries = data;
    },
    (error) => {
      console.error('Error fetching upcoming anniversary:', error);
    }
  );
}
newJoiners: any;
getNewUsersJoinies(): void {
  this.dataService.getRecentlyJoinedUsers().subscribe(
    (data) => {
      this.newJoiners = data;
    },
    (error) => {
      console.error('Error fetching upcoming birthdays:', error);
    }
  );
}

isToday(birthday: string): boolean {
  const today = new Date();
  const birthdayDate = new Date(birthday);
  return today.getDate() === birthdayDate.getDate() && today.getMonth() === birthdayDate.getMonth();
}
getWeekDayOfBirthday(birthday: string): string {
  const currentYear = new Date().getFullYear();
  const [month, day] = birthday.split('-'); // Assuming 'MM-dd' format in the backend
  const birthdayDate = new Date(currentYear, parseInt(month) - 1, parseInt(day));
  // Get the weekday name (e.g., "Monday", "Tuesday", etc.)
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return weekdays[birthdayDate.getDay()];
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

        if(this.userResignationInfo.isRecommendLastDay == 1){
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

  // Function to disable future dates
  disableFutureDates = (current: Date): boolean => {
    const today = new Date();
    // const maxDate = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + this.noticePeriodDuration); // Add 45 days to today's date

    // this.lastWorkingDay = maxDate;
    // console.log("Max Date: ", this.lastWorkingDay);
    // Disable dates from today to maxDate (inclusive)
    return current < today || current > maxDate;
  };

  noticePeriodDuration: number = 0;
  getNoticePeriodDuration(){
    this.dataService.getNoticePeriodDuration(this.userId).subscribe((res: any) => {
      if(res.status){
        this.noticePeriodDuration = res.object
      }
    })
  }

  selectRecommendDay(value: string): void {

    // this.userResignationInfo.userLastWorkingDay = ''

    this.userResignationInfo.isRecommendLastDay = value == 'Other' ? 1 : 0

    if(this.userResignationInfo.isRecommendLastDay == 0){
      this.userResignationInfo.userLastWorkingDay = ''
      this.calculateLasWorkingDay();
    }else{
      this.userResignationInfo.userLastWorkingDay = this.userResignationInfo.userLastWorkingDay 
    }
  }

  selectManagerDiscussion(value: string): void {
    this.userResignationInfo.isManagerDiscussion = value == 'Yes' ? 1 : 0
  }

  calculateLasWorkingDay(){
    const today = new Date();
    // const maxDate = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + this.noticePeriodDuration); // Add 45 days to today's date

    // this.lastWorkingDay = maxDate;
    // this.userResignationReq.lastWorkingDay = maxDate
    this.userResignationInfo.userLastWorkingDay = this.helperService.formatDateToYYYYMMDD(maxDate);
    // console.log("Max Date: ", this.lastWorkingDay);
  }

  showRevokeDiv: boolean = false;
  revokeReason: string = ''
  revokeResignation(){

  }

  clearForm(){
    this.userResignationInfo = this.userResignationInfo;
    this.revokeReason = ''
    this.userResignationInfo.revokeReason = ''
    this.showRevokeDiv = false;
  }

  // @ViewChild('closeResignationButton') closeResignationButton!: ElementRef
  userResignationReq: UserResignation = new UserResignation();
  resignationToggle: boolean = false;
  submitResignation(){
    this.resignationToggle = true;
    this.userResignationReq = this.userResignationInfo
    this.dataService.submitResignation(this.userResignationReq).subscribe((res: any) => {
        if(res.status){
          this.resignationToggle =false
          // this.helperService.resignationSubmitted.next(true);
          this.closeApproveModal.nativeElement.click()
          this.getUserResignationInfo()
          // this.clearForm();
        }
    })

    // console.log('reqs: ',this.userResignationReq)

  }


  getDynamicClass(index: number): object {
    if(index>=3){
      var mod = index % 3;
      return { [`birthday-box-${mod}`]: true };
    }else{

      return { [`birthday-box-${index}`]: true };
    }
  }

}
