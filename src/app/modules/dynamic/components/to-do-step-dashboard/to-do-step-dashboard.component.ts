import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-to-do-step-dashboard',
  templateUrl: './to-do-step-dashboard.component.html',
  styleUrls: ['./to-do-step-dashboard.component.css'],
})
export class ToDoStepDashboardComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private router: Router,
    private helperService: HelperService,
    private rbacService: RoleBasedAccessControlService
  ) {}

  ngOnInit(): void {
    this.getRoleDetails();
    this.isOrgOnboarTodayData();
    this.getOrganizationRegistratonProcessStepData();
    this.getStepsData();
    this.getOrganizationInitialToDoStepBar();
    // this.helperService.saveOrgSecondaryToDoStepBarData(0);
  }

  ROLE: any;
  async getRoleDetails() {
    this.ROLE = await this.rbacService.getRole();
  }

  

  showToDoStep: boolean = true;
  showToDoStepModal: boolean = false;
  showToDoStepTab: boolean = false;

  hideToDoStep() {
    this.showToDoStep = false;
    this.showToDoStepTab = true;
  }

  organizationRegistrationProcessResponse: any;
  getOrganizationRegistratonProcessStepData() {
    debugger;
    this.dataService.getOrganizationRegistratonProcessStepStatus().subscribe(
      (response) => {
        this.organizationRegistrationProcessResponse = response.listOfObject;
        // console.log("success");
      },
      (error) => {
        // console.log('error');
      }
    );
  }

  // routeToStep(route : string) {
  //   this.router.navigate([route]);
  // }

  routeToStep(route: string, name: string) {
    this.router.navigate([route], { queryParams: { name } });
  }

  stepsData: any;
  getStepsData() {
    debugger;
    this.dataService.getStepsData().subscribe(
      (response) => {
        this.stepsData = response.listOfObject[0];
        // console.log("success");
      },
      (error) => {
        // console.log('error');
      }
    );
  }

  getProgressPercentage(): number {
    if (this.stepsData?.totalSteps === 0) {
      return 0;
    }
    return (
      (this.stepsData?.totalCompletedSteps / this.stepsData?.totalSteps) * 100
    );
  }

  hideOrganizationInitialToDoStepBar() {
    debugger;
    this.dataService.hideOrganizationInitialToDoStepBar().subscribe(
      (response) => {
        // console.log("success");
        this.getOrganizationInitialToDoStepBar();
        location.reload();
      },
      (error) => {
        // console.log('error');
      }
    );
  }

  isToDoStep: boolean = false;
  getOrganizationInitialToDoStepBar() {
    debugger;
    this.dataService.getOrganizationInitialToDoStepBar().subscribe(
      (response) => {
        this.isToDoStep = response.object;
        // console.log("success");
      },
      (error) => {
        // console.log('error');
      }
    );
  }

  isToDoStepsCompleted: number = 0;
  isToDoStepsCompletedData(isOrgOnboardToday: number) {
    debugger;
    this.dataService.isToDoStepsCompleted().subscribe(
      (response) => {
        this.isToDoStepsCompleted = response.object;

        // if (this.isToDoStepsCompleted == 0 && isOrgOnboardToday == 1) {
        //   this.router.navigate(['/to-do-step-dashboard']);
        // } else {
          this.router.navigate(['/dashboard']);
        // }
        console.log('isToDoStepsCompletedFlag :', this.isToDoStepsCompleted);
      },
      (error) => {
        console.log('error');
      }
    );
  }

  isOrgOnboardToday: number = 0;
  isOrgOnboarTodayData() {
    debugger;
    this.dataService.isOrgOnboarToday().subscribe(
      (response) => {
        this.isOrgOnboardToday = response.object;
        
        this.isToDoStepsCompletedData(this.isOrgOnboardToday);
        console.log('isToDoStepsCompletedFlag :', this.isToDoStepsCompleted);
      },
      (error) => {
        console.log('error');
      }
    );
  }
  @ViewChild('close_button') close_button!: ElementRef;
  @ViewChild('videoIframe', { static: false }) youtubeIframe:
    | ElementRef<HTMLIFrameElement>
    | undefined;

  // Stops or pauses the video when modal closes
  stopVideo(): void {
    this.close_button.nativeElement.click();

    if (this.youtubeIframe) {
      // Ensure that contentWindow is correctly typed
      const iframeWindow = (
        this.youtubeIframe.nativeElement as HTMLIFrameElement
      ).contentWindow;

      const iframeElement = this.youtubeIframe.nativeElement as HTMLIFrameElement;
      iframeElement.src = '';
    }
    
  }



  setSrc(){
    if (this.youtubeIframe) {
    const iframeElement = this.youtubeIframe.nativeElement as HTMLIFrameElement;
      iframeElement.src = 'https://www.youtube.com/embed/jh7-qF48ANk?si=WJvojNbQucaWaknY';
    }
  }

  // Call this method when modal closes to stop the video
  onModalClose(): void {
    this.stopVideo();
    // this.pauseYouTubeVideo();
  }
}
