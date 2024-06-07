import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Key } from 'src/app/constant/key';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-sign-in-with-slack',
  templateUrl: './sign-in-with-slack.component.html',
  styleUrls: ['./sign-in-with-slack.component.css'],
})
export class SignInWithSlackComponent implements OnInit {
  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    this.userSignInWithSlack();
    this.getSlackAuthUrl();
  }

  isLoadingCompleted: boolean = false;
  isError: boolean = false;
  userSignInWithSlack() {
    debugger;
    const codeParam = new URLSearchParams(window.location.search).get('code');
    const stateParam = new URLSearchParams(window.location.search).get('state');
    this.isError = false;
    console.log('codeParam' + codeParam + 'stateParam' + stateParam);
    if (!codeParam || !stateParam) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.dataService.userSignInWithSlack(codeParam, stateParam).subscribe(
      (response: any) => {
        console.log(response.object);
        this.isLoadingCompleted = true;
        this.isError = false;
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
          this.router.navigate(['/dashboard']);
        }
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
    console.log(decodedToken);
    return decodedToken;
  }

  authUrl: string = '';

  getSlackAuthUrl(): void {
    debugger;
    this.dataService.getSlackAuthUrl().subscribe(
      (response: any) => {
        this.authUrl = response.message;
        console.log('authUrl' + this.authUrl);
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
