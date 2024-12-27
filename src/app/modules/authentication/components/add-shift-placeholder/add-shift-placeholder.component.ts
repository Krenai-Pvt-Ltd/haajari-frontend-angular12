import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';

@Component({
  selector: 'app-add-shift-placeholder',
  templateUrl: './add-shift-placeholder.component.html',
  styleUrls: ['./add-shift-placeholder.component.css']
})
export class AddShiftPlaceholderComponent implements OnInit {

  constructor(
    private dataService: DataService,
    private router: Router,
    private helperService: HelperService,
    private onboardingService: OrganizationOnboardingService,

  ) { }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token == null) {
      this.router.navigate(['/auth/signup']);
    }
  }

  isvideoloading: boolean = false;

  backPage() {
    this.checkShiftTimingExistsMethodCall();
  }


  isAddShiftBackLoading: boolean = false;
  checkShiftTimingExistsMethodCall() {
    this.isAddShiftBackLoading = true;
    this.dataService.shiftTimingExists().subscribe(
      (response: any) => {
        console.log(response);
        if (response.object) {
          this.dataService.markStepAsCompleted(3);
          // this.onboardingService.saveOrgOnboardingStep(3).subscribe();
          this.onboardingService.saveOrgOnboardingStep(3).subscribe((resp) => {
            this.onboardingService.refreshOnboarding();
          });
          // this.router.navigate(['/organization-onboarding/shift-time-list']);
        } else {
          this.dataService.markStepAsCompleted(2);
          // this.onboardingService.saveOrgOnboardingStep(2).subscribe();
          this.onboardingService.saveOrgOnboardingStep(2).subscribe((resp) => {
            this.onboardingService.refreshOnboarding();
          });
          // this.router.navigate(['/organization-onboarding/upload-team']);
        }

        setTimeout(() => {
          this.isAddShiftBackLoading = false;
        }, 5000);
        // this.isBackLoading = false;
        // this.onboardingService.refreshOnboarding();
      },
      (error) => {
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



  setSrc() {
    if (this.youtubeIframe) {
      const iframeElement = this.youtubeIframe.nativeElement as HTMLIFrameElement;
      iframeElement.src = 'https://www.youtube.com/embed/_P_5jBpDpsc?si=F2hd2KPHZ800QVjp';
    }
  }

  // Call this method when modal closes to stop the video
  onModalClose(): void {
    this.stopVideo();
    // this.pauseYouTubeVideo();
  }



}
