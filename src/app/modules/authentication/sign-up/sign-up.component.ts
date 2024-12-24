import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subscription, of, timer } from 'rxjs';
import { catchError, switchMap, take, tap } from 'rxjs/operators';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { UserReq } from 'src/app/models/userReq';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent implements OnInit {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  countDown: Subscription;
  counter: number = 10;
  tick = 1000;
  promotionalOffer:string='';
  readonly Constant = constant;

  constructor(
    private dataService: DataService,
    private router: Router,
    private rbacService: RoleBasedAccessControlService,
    private helperService: HelperService,
    private _routeParams: ActivatedRoute,
    private _onboardingService: OrganizationOnboardingService
  ) {
    this.countDown = timer(0, this.tick)
      .pipe(take(this.counter))
      .subscribe(() => {
        --this.counter;
        if (this.counter == 0) {
          this.countDown.unsubscribe();
        }
      });


      if (this._routeParams.snapshot.queryParamMap.has('offer') && !this.Constant.EMPTY_STRINGS.includes(this._routeParams.snapshot.queryParamMap.get('offer'))) {
        this.promotionalOffer = String(this._routeParams.snapshot.queryParamMap.get('offer'));
        this.setCookie("promotionalOffer", this.promotionalOffer, 7);
      }
  }

  ngOnInit(): void {
    // this.getSlackAuthUrl();
  }

  otp: string = '';
  loginButtonLoader: boolean = false;
  errorMessage: string = '';
  verifyOtpButtonFlag: boolean = false;
  enterPasswordFlag: boolean = false;
  errorPasswordFlag: boolean = false;

  confirmPassError: boolean = false;
  checkConfirmPassword() {
    this.confirmPassError = false;
    if (this.confirmPassword != this.password) {
      this.confirmPassError = true;
    }
  }

  ROLE: any;
  UUID: any;

  // signIn() {

  //   this.loginButtonLoader = true;
  //   this.dataService.loginUser(this.email, this.password).subscribe(async response => {

  //     console.log(response);
  //     this.helperService.subModuleResponseList = response.subModuleResponseList;

  //     localStorage.setItem('token', response.tokenResponse.access_token);
  //     localStorage.setItem('refresh_token', response.tokenResponse.refresh_token);

  //     this.ROLE = await this.rbacService.getRole();
  //     this.UUID = await this.rbacService.getUuid();

  //     if (this.ROLE === 'USER') {
  //       this.router.navigate(['/employee-profile'], { queryParams: { userId: this.UUID, dashboardActive: 'true' } });
  //     } else {
  //       const helper = new JwtHelperService();
  //       const onboardingStep = helper.decodeToken(response.tokenResponse.access_token).statusResponse;
  //         if (onboardingStep == "5") {
  //           this.router.navigate(['/dashboard']);
  //         } else {
  //           this.router.navigate(['/organization-onboarding/personal-information']);
  //         }
  //     }

  //   }, (error) => {
  //     console.log(error.error.message);
  //     this.errorMessage = error.error.message;
  //     this.loginButtonLoader = false;
  //   })
  // }

  signIn() {
    this.loginButtonLoader = true;
    this.dataService
      .loginUser(this.email, this.password)
      .pipe(
        tap((response) => {
          // console.log(response);
          this.helperService.subModuleResponseList =
            response.subModuleResponseList;
          localStorage.setItem('token', response.tokenResponse.access_token);
          localStorage.setItem(
            'refresh_token',
            response.tokenResponse.refresh_token
          );
        }),
        switchMap(() => this.rbacService.getRole()),
        tap((ROLE) => {
          this.ROLE = ROLE;
        }),
        switchMap(() => this.rbacService.getUUID()),
        tap((UUID) => {
          this.UUID = UUID;

          if (this.ROLE === 'USER') {
            this.router.navigate([Key.EMPLOYEE_PROFILE_ROUTE], {
              queryParams: { userId: this.UUID, dashboardActive: 'true' },
            });
          } else {
            const helper = new JwtHelperService();
            const token = localStorage.getItem('token');
            if (token != null) {
              const onboardingStep = helper.decodeToken(token).statusResponse;
              if (onboardingStep == '5') {
                this.router.navigate(['/dashboard']);
              } else {
                this.router.navigate([
                  '/organization-onboarding/personal-information'
                ], { replaceUrl: true });
              }
            }
          }
        }),
        catchError((error) => {
          console.log(error.error.message);
          this.errorMessage = error.error.message;
          this.loginButtonLoader = false;
          return of(null); // handle error appropriately
        })
      )
      .subscribe();
  }

  enableBack: boolean = false;
  signInWithEmail() {
    this.enableBack = true;
    this.isWhatsappLogin = false;
    this.isEmailLogin = true;
    this.showOtpInput = false;
    this.enterPasswordFlag = false;
    this.isOtpVerify = false;
    this.verifyOtpButtonFlag = false;
    this.otpErrorMessage = '';
    this.errorMessage = '';
  }

  signInWithWhatsapp() {
    // this.showOtpInput = false;
    // this.enableBack = true;
    // this.isEmailLogin = false;
    // this.isWhatsappLogin = true;
    // this.phoneNumber = '';
    // this.isOtpVerify = false;
    // this.otpErrorMessage = '';
    // this.errorMessage = '';
    this.router.navigate(['/auth/onboarding-whatapp'], { replaceUrl: true });
  }

  redirectToRegister() {
    this.router.navigate(['/onboarding']);
  }

  ngAfterViewInit() {
    this.autoplayVideo();
  }

  autoplayVideo() {
    var div = document.getElementById('videoId');
    if (div) {
      //@ts-ignore
      div!.muted = true;
      //@ts-ignore
      div.autoplay = true;
      //@ts-ignore
      div!.play();
    }
  }

  onOtpInputChange(index: number) {
    // console.log(`Input ${index} changed`);
  }

  private debounceTimer: any;
  onOtpChange(event: any) {
    this.otp = event;
    // console.log(this.otp);

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      if (this.otp.length == 6) {
        this.verifyOtp();
      }
    }, 300);
  }

  @ViewChild('otpInput') otpInput: any;

  createPasswordFlag: boolean = false;
  otpErrorMessage: string = '';
  verifyOtp() {
    if (this.isWhatsappLogin) {
      this.verifyOtpByWhatsappMethodCall();
    } else {
      this.loading = true;
      this.dataService.verifyUserOtp(this.email, this.otp).subscribe(
        (response: any) => {
          if (response.object) {
            this.errorMessage = '';
            this.verifyOtpButtonFlag = false;
            this.otp = '';
            this.createPasswordFlag = true;
            this.showMessageFlag = false;
            this.isOtpVerify = false;
          } else {
            this.isOtpVerify = true;
            this.loading = false;
          }
        },
        (error) => {
          this.otpErrorMessage = error.error.message;
          this.loading = false;
          console.error('Verification failed:', error);
        }
      );
    }
  }

  registerPassLoader: boolean = false;
  registerUserPassword() {
    this.registerPassLoader = true;
    this.dataService.registerPassword(this.email, this.password).subscribe(
      (response) => {
        this.registerPassLoader = false;
        this.showOtpInput = false;
        // console.log('Password Created successfully:', response);
        this.password = '';
        this.confirmPassword = '';
        this.createPasswordFlag = false;
        this.enterPasswordFlag = true;
      },
      (error) => {
        this.registerPassLoader = false;
        console.error('Verification failed:', error);
      }
    );
  }

  showMessageFlag: boolean = false;
  checkUserPresence() {
    this.checkFormValidation();

    if (this.isFormInvalid == true) {
      return;
    } else {
      this.loginButtonLoader = true;
      this.dataService.checkUserPresence(this.email).subscribe(
        (response) => {
          this.loginButtonLoader = false;
          if (response.isExistingUser == false) {
            this.errorMessage =
              'Please register yourself first Or contact to your admin!';
          }

          if (response.isEnableStatus == false) {
            this.errorMessage =
              'You are disabled by admin, please contact to your admin!';
          }
          if (response.isPassword == true) {
            this.enterPasswordFlag = true;
            this.errorMessage = '';
          } else if (response.isPassword == false) {
            this.showMessageFlag = true;
            this.verifyOtpButtonFlag = true;
            this.errorMessage = '';
          }
          // console.log('response :', response);
        },
        (error) => {
          this.loginButtonLoader = false;
          console.log('error :', error);
        }
      );
    }
  }

  whatsappOtp: boolean = true;
  sendUserOtpToMail() {
    this.whatsappOtp = false;
    this.sendOtpLoader = true;
    this.dataService.sendUserOtpToMailNew(this.email).subscribe(
      (response: any) => {
        if (response.status) {
          this.sendOtpLoader = false;
          this.showOtpInput = true;
          clearInterval(this.interval);
          this.time = 30;
          this.startTimer();
        }
      },
      (error) => {
        console.log('error :', error);
      }
    );
  }

  resetUserPassword() {
    this.registerPassLoader = true;
    this.dataService.resetPassword(this.email, this.password).subscribe(
      (response) => {
        this.registerPassLoader = false;
        this.showOtpInput = false;
        // console.log('Password Created successfully:', response);
        this.password = '';
        this.confirmPassword = '';
        this.createPasswordFlag = false;
        this.enterPasswordFlag = true;
      },
      (error) => {
        this.registerPassLoader = false;
        console.log('error :', error);
      }
    );
  }

  @ViewChild('otpVerification') otpVerification: any;

  closeDeleteModal() {
    this.otpVerification.nativeElement.click();
  }

  resetPasswordFlag: boolean = false;
  forgotPasswordFun() {
    this.errorMessage = '';
    this.password = '';
    this.otp = '';
    this.otpErrorMessage = '';
    this.enterPasswordFlag = false;
    this.verifyOtpButtonFlag = true;
  }

  @ViewChild('whatsappOtpSend') whatsappOtpSend!: ElementRef;
  onPhoneNumberChange() {
    if (this.isValidPhoneNumber(this.phoneNumber)) {
      this.signInByWhatsapp();
    }
  }

  isValidPhoneNumber(phoneNumber: string): boolean {
    // Implement your validation logic, example:
    return phoneNumber.length === 10 && /^\d+$/.test(phoneNumber);
  }

  @ViewChild('otpVerificationModalButton')
  otpVerificationModalButton!: ElementRef;
  isEmailLogin: boolean = false;
  isWhatsappLogin: boolean = false;
  phoneNumber: string = '';
  showOtpInput: boolean = false;
  sendOtpLoader: boolean = false;
  signInByWhatsapp() {
    debugger;
    this.sendOtpLoader = true;
    this.dataService.signInByWhatsappNew(this.phoneNumber).subscribe(
      (response: any) => {
        if (response.status) {
          clearInterval(this.interval);
          this.time = 30;
          this.startTimer();
          this.verifyOtpButtonFlag = true;
          this.sendOtpLoader = false;
          this.showOtpInput = true;
        }
      },
      (error) => {
        console.log('error :', error);
      }
    );
  }

  @ViewChild('closeOtpVerifyModal') closeOtpVerifyModal!: ElementRef;

  loading: boolean = false;
  isOtpVerify: boolean = false;
  verifyOtpByWhatsappMethodCall() {
    this.loading = true;
    this.dataService
      .verifyOtpByWhatsappNew(this.phoneNumber, this.otp,"")
      .subscribe(
        async (response: any) => {
          if (response.status) {
            this.loading = false;
            this.helperService.subModuleResponseList =
              response.object.subModuleResponseList;
            localStorage.setItem(
              'token',
              response.object.tokenResponse.access_token
            );
            localStorage.setItem(
              'refresh_token',
              response.object.tokenResponse.refresh_token
            );
            await this.rbacService.initializeUserInfo();
            const helper = new JwtHelperService();
            const onboardingStep = helper.decodeToken(
              response.object.tokenResponse.access_token
            ).statusResponse;
            const role = helper.decodeToken(
              response.object.tokenResponse.access_token
            ).role;
            if (role == 'ADMIN') {
              if (onboardingStep == '5') {
                this.router.navigate(['/dashboard']);
              } else {
                this.router.navigate([
                  '/organization-onboarding/personal-information'
                ], { replaceUrl: true });
              }
            } else {
              this.router.navigate(['/dashboard']);
            }
          } else {
            this.isOtpVerify = true;
            this.loading = false;
            this.otpErrorMessage = response.message;
          }
        },
        (error) => {
          this.otpErrorMessage = error.error.message;
          this.loading = false;
        }
      );
  }
  isFormInvalid: boolean = false;
  @ViewChild('loginForm') loginForm!: NgForm;
  checkFormValidation() {
    if (this.loginForm.invalid) {
      this.isFormInvalid = true;
      return;
    } else {
      this.isFormInvalid = false;
    }
  }

  @ViewChild('userCreateModal') userCreateModal!: ElementRef;
  @ViewChild('closeUserCreateModal') closeUserCreateModal!: ElementRef;
  userReq: UserReq = new UserReq();
  createLoader: boolean = false;

  transform(value: number): string {
    const minutes: number = Math.floor(value / 60);
    return (
      ('00' + minutes).slice(-2) +
      ':' +
      ('00' + Math.floor(value - minutes * 60)).slice(-2)
    );
  }

  resendOtp() {
    if (!this.isWhatsappLogin) {
      this.sendUserOtpToMail();
    } else {
      this.signInByWhatsapp();
    }
  }

  time: number = 30;
  interval: any;
  startTimer() {
    this.interval = setInterval(() => {
      this.time--;
      if (this.time == 0) {
        clearInterval(this.interval);
      }
    }, 1000);
  }

  changeNumber() {
    this.showOtpInput = false;
    this.verifyOtpButtonFlag = false;
    this.phoneNumber = '';
    this.email = '';
  }

  backToLogin() {
    this.enableBack = false;
    this.isWhatsappLogin = false;
    this.isEmailLogin = false;
    this.showOtpInput = false;
  }
  authUrl: string = '';
  workspaceUrl: string = '';
  workspaceName: string = '';
  // getSlackAuthUrl(event: MouseEvent): void {
  //   debugger;
  //   event.preventDefault(); // Prevent default anchor behavior
  //   this.dataService.getSlackAuthUrl().subscribe(
  //     (response: any) => {
  //       this.authUrl = response.message;
  //       console.log('authUrl' + this.authUrl);
  //       window.open(this.authUrl);
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
        // console.log('authUrl: ' + this.authUrl);

        // // Traverse up the DOM to find the closest anchor element
        // const target = event.target as HTMLElement;
        // const anchor = target.closest('a') as HTMLAnchorElement;

        // if (anchor) {
        //   anchor.href = this.authUrl;
        //   // Redirect in the same tab
        //   window.location.href = this.authUrl;
        // }
        window.location.href = this.authUrl;
      },
      (error) => {
        console.error('Error fetching Slack auth URL', error);
      }
    );
  }

  // getSlackAuthUrlForSignInWithSlack(): void {
  //   debugger;
  //   this.dataService.getSlackAuthUrlForSignInWithSlack().subscribe(
  //     (response: any) => {
  //       this.authUrl = response.message;
  //       console.log('authUrl' + this.authUrl);
  //     },
  //     (error) => {
  //       console.error('Error fetching Slack auth URL', error);
  //     }
  //   );
  // }

  extractWorkspaceName(url: string): string {
    const regex = /https:\/\/([^.]+)\.slack\.com/;
    const matches = url.match(regex);
    // console.log('URL:', url);
    // console.log('Matches:', matches);
    return matches ? matches[1] : '';
  }


  setCookie(name:string, value:string, days:number) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // convert days to milliseconds
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
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


