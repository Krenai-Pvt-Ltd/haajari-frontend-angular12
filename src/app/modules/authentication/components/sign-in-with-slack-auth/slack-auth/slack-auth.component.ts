import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Organization } from 'src/app/models/organization';
// import { CookieService } from 'ngx-cookie-service';
import { DataService } from 'src/app/services/data.service';
import { jwtDecode } from 'jwt-decode';
import { Key } from 'src/app/constant/key';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { constant } from 'src/app/constant/constant';
import { OnboardingService } from 'src/app/services/onboarding.service';

@Component({
  selector: 'app-slack-auth',
  templateUrl: './slack-auth.component.html',
  styleUrls: ['./slack-auth.component.css'],
})
export class SlackAuthComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private httpClient: HttpClient,
    private router: Router,
    private helperService: HelperService,
    private rbacService: RoleBasedAccessControlService,
    private onboardingService: OnboardingService
  ) {}

  ngOnInit(): void {
    debugger;
    //this.convertAccessTokenFromCode();
    this.registerOrganizationByCodeParam();
    this.continueInSlack();
    
    
  }

  // formatOne = (percent: number): string => `${percent}`;
  // formatTwo = (): string => `Done`;

  isSuccessComponent: boolean = false;
  isErrorComponent: boolean = false;

  isRouteOnboarding: boolean = false;
  isRouteDashboard: boolean = false;
  errorMessage: string = '';
  errorFlag: boolean = false;
  promotionCode:string='';
  registerOrganizationByCodeParam() {
    debugger;
    const codeParam = new URLSearchParams(window.location.search).get('code');
    const stateParam = new URLSearchParams(window.location.search).get('state');

    // console.log('codeParam' + codeParam + 'stateParam' + stateParam);
    if (!codeParam || !stateParam) {
      this.router.navigate(['/auth/login']);
      // alert('Invalid URL: Missing code parameter');
      return;
    }
    this.promotionCode = this.getCookie('promotionalOffer');
    this.errorFlag = false;
    this.dataService
      .registerOrganizationUsingCodeParam(
        codeParam,
        stateParam,
        this.helperService.getTimeZone(),
        this.promotionCode
      )
      .subscribe(
        async (response: any) => {
          // console.log(response.object);
          if(!constant.EMPTY_STRINGS.includes(this.promotionCode) ){
            this.promotionCode ='';
            this.deleteAllCookies();
          }
         
          localStorage.setItem('token', response.object.access_token);
          localStorage.setItem('refresh_token', response.object.refresh_token);

          await this.rbacService.initializeUserInfo();
          
          await this.onboardingService.checkOnboardingStatus();
           console.log('this.helperService.orgStepId-------------', this.helperService.orgStepId);
          if(this.helperService.orgStepId == +constant.ORG_ONBOARDING_ONBOARDING_COMPLETED_STEP_ID){
            this.router.navigate(['/dashboard']);
            this.isSuccessComponent = false;
          }else {
            this.isSuccessComponent = true;
          }

          
          if(this.isSuccessComponent) {
            this.startCountdown();
          }
          this.isErrorComponent = false;


          this.getSlackUserCountData();
          debugger;
          const decodedValue = this.decodeFirebaseAccessToken(
            response.object.access_token
          );
          
          if(decodedValue)
          

          Key.LOGGED_IN_USER = decodedValue;

          debugger;
          // console.log(decodedValue);

          this.isRouteDashboard = true;
          this.isRouteOnboarding = false;
          // if (
          //   decodedValue.httpCustomStatus === 'UPDATED' &&
          //   decodedValue.statusResponse === 'Attendance Rule Setting'
          // ) {

          //   this.router.navigate(['/dashboard']);
          // }
          // } else {
          //   this.isRouteDashboard = false;
          //   this.isRouteOnboarding = true;
          //   // this.router.navigate([
          //   //   '/organization-onboarding/personal-information',
          //   // ]);
          // }
        },
        (error) => {
          console.log(error);
          if (error.error.message === 'false') {
            this.errorMessage =
              'It appears that your email is already registered with Hajiri under a different workspace.';
            this.errorFlag = false;
          } else {
            this.errorFlag = true;
            this.errorMessage =
              'If you encounter any issues, we encourage you to utilize our contact form to reach out for assistance Or Login Again';
          }
          this.isSuccessComponent = false;
          clearInterval(this.intervalId);
          this.isErrorComponent = true;
        }
      );
  }

  countdown: number = 20; // Countdown duration in seconds
  countdownPercent: number = 100; // Starts at 100%
  intervalId: any;
  formatOne = (percent: number): string => `${percent}`;
  formatTwo = (): string => `Done`;
  maxCountdownValue = 20;
  
  get progress() {
    return (this.countdown / this.maxCountdownValue) * 100;
  }

  // startCountdown(): void {
  //   this.intervalId = setInterval(() => {
  //     this.countdown--;
  //     if (this.countdown === 0) {
  //       this.redirectNow();
  //     }
  //   }, 1000);
  // }
  startCountdown(): void {
    const totalSeconds = this.countdown; 

    this.intervalId = setInterval(() => {
      this.countdown--;

      if (this.countdown > 1) {
       
        this.countdownPercent = (this.countdown / totalSeconds) * 100;
      } else if (this.countdown === 1) {
        
        // this.countdownPercent = 0; 
        this.countdown = 0;
        clearInterval(this.intervalId);
        setTimeout(() => this.redirectNow(), 1000);
      } 
      // else if (this.countdown === 0) {
      //   this.countdown = 0;
      //   clearInterval(this.intervalId);
      //   setTimeout(() => this.redirectNow(), 1000);
      //   this.redirectNow();
      // }
    }, 1000); 
  }

  redirectNow(): void {
    clearInterval(this.intervalId); 
    this.navigateToRoute();
  }

  navigateToRoute(): void {
    debugger;
    // this.router.navigate(['/dashboard']);
    // this.router.navigate(['/organization-onboarding/personal-information']);
    this.router.navigate([constant.ORG_ONBOARDING_PERSONAL_INFORMATION_ROUTE]);

    // this.helperService.showToast(
    //   'Please add shift settings in the Attendance Settings section and leave settings in the Leave Settings section to establish shift rules for your organization’s users and assign their leave quotas, if not already configured.',
    //   Key.TOAST_STATUS_SUCCESS
    // );
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  redirectToLogin() {
    this.router.navigate(['/auth/login']);
  }

  decodeFirebaseAccessToken(access_token: string) {
    const decodedToken: any = jwtDecode(access_token);

    debugger;
    // console.log(decodedToken);
    return decodedToken;
  }
  workspaceName: any;
  slackWorkspaceUrl: string = '';
  continueInSlack() {
    // this.workspaceName = localStorage.getItem('WORKSPACENAME');
    this.slackWorkspaceUrl = Key.SLACK_WORKSPACE_URL;
    // window.location.href = slackWorkspaceUrl;
  }

  // organization: Organization = new Organization();

  // convertAccessTokenFromCode(){
  //   debugger
  //   const codeParam = new URLSearchParams(window.location.search).get('code');
  //   if (!codeParam) {
  //     alert('Invalid URL: Missing code parameter');
  //     return;
  //   }

  //   this.dataService.getAccessToken(codeParam).subscribe((response : any)=>{
  //     // console.log(response.body);
  //     const jsonData = (JSON.parse(response.body))
  //     this.organization.appId = jsonData.app_id;
  //     this.organization.token = jsonData.access_token;
  //     this.organization.webhook = jsonData.incoming_webhook.url;
  //     this.organization.name = jsonData.team.name;
  //     this.organization.userToken = jsonData.authed_user.access_token;
  //     this.organization.configureUrl = jsonData.incoming_webhook.configuration_url;

  //     // console.log(token);
  //     this.saveToken(this.organization);
  //   }, (error:any)=>{
  //     console.log('error fetching');
  //   });

  // }

  // saveToken(organization : Organization) {
  //   debugger
  //  this.dataService.saveTokenForOrganization(organization).subscribe((response: any) => {
  //       debugger
  //       console.log('Token saved:', response);
  //       const id = response.id;
  //       localStorage.setItem('id', id.toString());
  //     },
  //     (error: any) => {
  //       console.error('Error saving token:', error);
  //     }
  //   );
  // }

  // saveUser(token:any){
  //   this.dataService.saveUserData(token)
  //   .subscribe(
  //     (response: any) => {
  //       console.log('Users Data saved:', response);

  //     },
  //     (error: any) => {
  //       console.error('Error saving Users Data:', error);
  //     }
  //   );
  // }
  
  slackUserCount: number = 0;
  getSlackUserCountData() {
    this.dataService.getSlackUserCount().subscribe((response: any)=>{
      this.slackUserCount = response.object
    },
    (error) => {
      console.log(error);
    }
  );
  }


    // Get a cookie for promotionalOffer
    getCookie(name:string) {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) == 0) 
          return c.substring(nameEQ.length, c.length);
      }
      return '';
    }


    deleteAllCookies() {
      var cookies = document.cookie.split(";");
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    }
}
