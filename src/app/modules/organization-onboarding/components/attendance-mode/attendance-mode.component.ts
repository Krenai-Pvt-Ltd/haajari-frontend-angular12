import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { AttendanceMode } from 'src/app/models/attendance-mode';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';

@Component({
  selector: 'app-attendance-mode',
  templateUrl: './attendance-mode.component.html',
  styleUrls: ['./attendance-mode.component.css']
})
export class AttendanceModeComponent implements OnInit {

  constructor(private dataService : DataService, private helperService : HelperService, private router : Router, private onboardingService: OrganizationOnboardingService) { }

  ngOnInit(): void {
    this.getAttendanceModeAllMethodCall();
    this.getAttendanceModeMethodCall();
  }

  isAttendanceModeSelected: boolean = false;
  @ViewChild("attendancewithlocationssButton") attendancewithlocationssButton !: ElementRef;
  updateAttendanceModeMethodCall(attendanceModeId: number) {
    this.dataService.updateAttendanceMode(attendanceModeId).subscribe((response) => {
      this.getAttendanceModeMethodCall();
      if (attendanceModeId == 2 || attendanceModeId == 3) {
        this.attendancewithlocationssButton.nativeElement.click();
      }
      setTimeout(() => {
        if (attendanceModeId == 1) {
          this.isAttendanceModeSelected = true;
        }
      }, 1000);

    }, (error) => {
      this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
    })
  }



  selectedAttendanceModeId: number = 0;
  getAttendanceModeMethodCall() {
    debugger
    this.dataService.getAttendanceModeNew().subscribe((response:any) => {
      debugger
      if(response.status){
        this.selectedAttendanceModeId = response.object.id;
      }
    }, (error) => {
      console.log(error);
    })
  }

  attendanceModeList: AttendanceMode[] = [];
  getAttendanceModeAllMethodCall() {
    debugger
    this.dataService.getAttendanceModeAll().subscribe((response) => {
      this.attendanceModeList = response;
    }, (error) => {
      console.log(error);
    })
  }

  goToDashboardSection(){
    this.dataService.markStepAsCompleted(5);
    this.onboardingService.saveOrgOnboardingStep(5).subscribe();
    this.router.navigate(['/dashboard']);
  }


}
