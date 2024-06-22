import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Organization } from 'src/app/models/organization';
// import { CookieService } from 'ngx-cookie-service';
import { DataService } from 'src/app/services/data.service';
import { jwtDecode } from 'jwt-decode';
import { Key } from 'src/app/constant/key';
import { HelperService } from 'src/app/services/helper.service';

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
    private helperService: HelperService
  ) {}

  ngOnInit(): void {
    debugger;
    //this.convertAccessTokenFromCode();
    this.registerOrganizationByCodeParam();
    this.continueInSlack();
  }

  isSuccessComponent: boolean = false;
  isErrorComponent: boolean = false;

  isRouteOnboarding: boolean = false;
  isRouteDashboard: boolean = false;
  errorMessage: string = '';
  errorFlag: boolean = false;
  registerOrganizationByCodeParam() {
    debugger;
    const codeParam = new URLSearchParams(window.location.search).get('code');
    const stateParam = new URLSearchParams(window.location.search).get('state');

    console.log('codeParam' + codeParam + 'stateParam' + stateParam);
    if (!codeParam || !stateParam) {
      this.router.navigate(['/auth/login']);
      // alert('Invalid URL: Missing code parameter');
      return;
    }
    this.errorFlag = false;
    this.dataService
      .registerOrganizationUsingCodeParam(codeParam, stateParam, this.helperService.getTimeZone())
      .subscribe(
        (response: any) => {
          console.log(response.object);
          this.isSuccessComponent = true;
          this.isErrorComponent = false;

          localStorage.setItem('token', response.object.access_token);
          localStorage.setItem('refresh_token', response.object.refresh_token);

          debugger;
          const decodedValue = this.decodeFirebaseAccessToken(
            response.object.access_token
          );

          Key.LOGGED_IN_USER = decodedValue;

          debugger;
          console.log(decodedValue);

          if (
            decodedValue.httpCustomStatus === 'UPDATED' &&
            decodedValue.statusResponse === 'Attendance Rule Setting'
          ) {
            this.isRouteDashboard = true;
            this.isRouteOnboarding = false;
            // this.router.navigate(['/dashboard']);
          }
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
          this.isErrorComponent = true;
        }
      );
  }

  navigateToRoute(): void {
    debugger;
    if (this.isRouteOnboarding) {
      this.router.navigate(['/organization-onboarding/personal-information']);
    } else if (this.isRouteDashboard) {
      this.router.navigate(['/dashboard']);
    }
  }

  redirectToLogin() {
    this.router.navigate(['/auth/login']);
  }

  decodeFirebaseAccessToken(access_token: string) {
    const decodedToken: any = jwtDecode(access_token);

    debugger;
    console.log(decodedToken);
    return decodedToken;
  }
  workspaceName: any;
  slackWorkspaceUrl: string = '';
  continueInSlack() {
    // this.workspaceName = localStorage.getItem('WORKSPACENAME');
    this.slackWorkspaceUrl = `https://slack.com/app_redirect?app=A05QD5T9EK1&tab=home`;
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
}
