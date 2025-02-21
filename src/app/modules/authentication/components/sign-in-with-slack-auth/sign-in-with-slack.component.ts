import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Key } from 'src/app/constant/key';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-sign-in-with-slack',
  templateUrl: './sign-in-with-slack.component.html',
  styleUrls: ['./sign-in-with-slack.component.css'],
})
export class SignInWithSlackComponent implements OnInit {
  constructor(private dataService: DataService, private router: Router, private rbacService: RoleBasedAccessControlService, private onboardingService: OnboardingService, private helperService: HelperService) {}

  ngOnInit(): void {
    this.userSignInWithSlack();
    // this.getSlackAuthUrl();
  }

  isLoadingCompleted: boolean = false;
  isError: boolean = false;
  userSignInWithSlack() {
    debugger;
    const codeParam = new URLSearchParams(window.location.search).get('code');
    const stateParam = new URLSearchParams(window.location.search).get('state');
    this.isError = false;
    // console.log('codeParam' + codeParam + 'stateParam' + stateParam);
    if (!codeParam || !stateParam) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.dataService.userSignInWithSlack(codeParam, stateParam).subscribe(
      async (response: any) => {
        // console.log(response.object);
        this.isLoadingCompleted = true;
        this.isError = false;
        localStorage.setItem('token', response.object.access_token);
        localStorage.setItem('refresh_token', response.object.refresh_token);
        await this.rbacService.initializeUserInfo();
        const decodedValue = this.decodeFirebaseAccessToken(
          response.object.access_token
        );

        Key.LOGGED_IN_USER = decodedValue;

        debugger;

        await this.onboardingService.checkOnboardingStatus();
        console.log('this.helperService.orgStepId-------------', this.helperService.orgStepId);
                  
        // console.log(decodedValue);
        this.router.navigate(['/dashboard']);
        // if (
        //   decodedValue.httpCustomStatus === 'UPDATED' &&
        //   decodedValue.statusResponse === 'Attendance Rule Setting'
        // ) {
        //   this.router.navigate(['/dashboard']);
        // }
        // } else {
        //   this.router.navigate([
        //     '/organization-onboarding/personal-information',
        //   ]);
        // }
      },
      (error) => {
        this.isError = true;
        this.isLoadingCompleted = true;
        console.log(error);
      }
    );
  }

  decodeFirebaseAccessToken(access_token: string) {
    const decodedToken: any = jwtDecode(access_token);

    debugger;
    // console.log(decodedToken);
    return decodedToken;
  }

  authUrl: string = '';

  // getSlackAuthUrl(): void {
  //   debugger;
  //   this.dataService.getSlackAuthUrl().subscribe(
  //     (response: any) => {
  //       this.authUrl = response.message;
  //       console.log('authUrl' + this.authUrl);
  //     },
  //     (error) => {
  //       console.error('Error fetching Slack auth URL', error);
  //     }
  //   );
  // }

  getSlackAuthUrl(event: MouseEvent): void {
    event.preventDefault(); // Prevent default anchor behavior

    this.dataService.getSlackAuthUrl().subscribe(
      (response: any) => {
        this.authUrl = response.message;
        console.log('authUrl: ' + this.authUrl);

        // Traverse up the DOM to find the closest anchor element
        const target = event.target as HTMLElement;
        const anchor = target.closest('a') as HTMLAnchorElement;

        if (anchor) {
          anchor.href = this.authUrl;
          // Redirect in the same tab
          window.location.href = this.authUrl;
        }
      },
      (error) => {
        console.error('Error fetching Slack auth URL', error);
      }
    );
  }

  continueInSlack(): void {
    if (this.authUrl) {
      window.location.href = this.authUrl;
    } else {
      console.error('Auth URL is not set');
    }
  }
}
