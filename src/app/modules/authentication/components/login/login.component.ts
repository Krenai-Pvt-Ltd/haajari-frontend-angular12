import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subscription, of, timer } from 'rxjs';
import { catchError, switchMap, take, tap } from 'rxjs/operators';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { UserReq } from 'src/app/models/userReq';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  countDown: Subscription;
  counter: number = 10;
  tick = 1000;

  readonly constant=constant;
  constructor(
    private dataService: DataService,
    private router: Router,
    private rbacService: RoleBasedAccessControlService,
    private helperService: HelperService,
    private _subscriptionService: SubscriptionPlanService,
    private onboardingService: OnboardingService 
  ) {
    this.returnUrl = localStorage.getItem('returnUrl') || '/';
     localStorage.removeItem('returnUrl');
     console.log('kkkkkkkkkkkkkkk', this.returnUrl);
    const token = localStorage.getItem('token');
    if (!constant.EMPTY_STRINGS.includes(token)) {
      this.router.navigate(['/dashboard']);
    }else{
      console.log
      localStorage.clear();
    }
    this.countDown = timer(0, this.tick)
      .pipe(take(this.counter))
      .subscribe(() => {
        --this.counter;
        if (this.counter == 0) {
          this.countDown.unsubscribe();
        }
      });
  }

  returnUrl: string='/' ;
  ngOnInit(): void {
    // this.getSlackAuthUrlForSignInWithSlack();
     
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

  signIn() {
    debugger
    this.loginButtonLoader = true;
    this.dataService.loginUser(this.email, this.password).pipe(
        tap(async (response) => {

          this.helperService.subModuleResponseList = response.subModuleResponseList;
          localStorage.setItem('token', response.tokenResponse.access_token);
          localStorage.setItem('refresh_token',response.tokenResponse.refresh_token);
          
          await this.rbacService.initializeUserInfo();
          this.UUID=this.rbacService.userInfo.uuid;
          this.ROLE = this.rbacService.userInfo.role;

         if (this.ROLE === 'USER') {
          await this.onboardingService.checkSubscriptionPlan();
          this.helperService.orgStepId = 5;
          this.onboardingService.isLoadingOnboardingStatus = false;
          // console.log('kkkkkkkkkkkkkkk', this.returnUrl);
          this.router.navigateByUrl(this.returnUrl);
          
        } else if (this.ROLE == 'HR ADMIN') {
           this.router.navigate(['/employee-onboarding-data']);
        }
        else {
          await this._subscriptionService.LoadAsync();
          const helper = new JwtHelperService();
          const token = localStorage.getItem('token');
          if (token != null) {
            const onboardingStep = helper.decodeToken(token).statusResponse;
            this.helperService.orgStepId = onboardingStep;
            if (onboardingStep < 5) {
              // this.router.navigate(['/organization-onboarding/personal-information']);
              this.router.navigate([constant.ORG_ONBOARDING_PERSONAL_INFORMATION_ROUTE]);

              // return false;
            } else {

              if(this.rbacService.shouldDisplay('dashboard')){
                this.router.navigate([constant.DASHBOARD_ROUTE]);
            } else {
              this.router.navigate([Key.EMPLOYEE_PROFILE_ROUTE], {
                queryParams: { userId: this.UUID, dashboardActive: 'true' },
              });
            }
          }
          }
        }
        }),

        
        switchMap(() => this.rbacService?.userInfo?.uuid),
        catchError((error) => {
          console.log(error);
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
    this.showOtpInput = false;
    this.enableBack = true;
    this.isEmailLogin = false;
    this.isWhatsappLogin = true;
    this.phoneNumber = '';
    this.isOtpVerify = false;
    this.otpErrorMessage = '';
    this.errorMessage = '';
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
    debugger
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
    debugger
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
            await this._subscriptionService.LoadAsync();
            const helper = new JwtHelperService();
            const onboardingStep = helper.decodeToken(
              response.object.tokenResponse.access_token
            ).statusResponse;
            const role = helper.decodeToken(
              response.object.tokenResponse.access_token
            ).role;
            // this.onboardingService.isLoadingOnboardingStatus = false;
            if (role == 'ADMIN') {
              if (onboardingStep == '5') {
                await this.onboardingService.checkSubscriptionPlan();
                this.helperService.orgStepId = 5;
                this.onboardingService.isLoadingOnboardingStatus = false;
               
                this.router.navigate(['/dashboard']);

              } else {
                // this.router.navigate([
                //   '/organization-onboarding/personal-information',
                // ]);
                this.router.navigate([
                  constant.ORG_ONBOARDING_PERSONAL_INFORMATION_ROUTE
                ]);
              }
            } else {
              await this.onboardingService.checkSubscriptionPlan();
              this.helperService.orgStepId = 5;
              this.onboardingService.isLoadingOnboardingStatus = false;
              this.router.navigate([constant.DASHBOARD_ROUTE]);
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

  @ViewChild('otp1Input') otp1Input!: ElementRef<HTMLInputElement>;
  changeNumber() {
    this.showOtpInput = false;
    this.verifyOtpButtonFlag = false;
    this.phoneNumber = '';
    this.email = '';
    this.focusOnFirstInput();
    // if (this.firstOtpInput) {
    //   this.firstOtpInput.nativeElement.focus();
    // }
    
    // this.activeInputIndex = 1;
  }

  focusOnFirstInput() {
    setTimeout(() => {
      this.otp1Input.nativeElement.focus(); 
    }, 0); 
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


  getSlackAuthUrlForSignInWithSlack(event: MouseEvent): void {
    event.preventDefault(); // Prevent default anchor behavior

    this.dataService.getSlackAuthUrlForSignInWithSlack().subscribe(
      (response: any) => {
        this.authUrl = response.message;
        // console.log('authUrl: ' + this.authUrl);

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

  //  previous
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


  otp1: string = '';
  otp2: string = '';
  otp3: string = '';
  otp4: string = '';
  otp5: string = '';
  otp6: string = '';
  activeInputIndex: number = 1;
  isPasting: boolean = false;


   moveToNext(event: any, nextInput: any, index: number) {

    if(this.isPasting) {
      return;
    }
   
    const input = event.target;
    const value = input.value;
  
   
    if (value.length >= 1 && nextInput) {
      nextInput.focus();
      this.activeInputIndex = index;
    }
  
    
    this.otp = this.otp1 + this.otp2 + this.otp3 + this.otp4 + this.otp5 + this.otp6;
  
   
    this.onOtpChange(this.otp);
  }
  
  // Handle backspace navigation
  moveToPrevious(event: any, previousInput: any, index: number) {

    this.otpErrorMessage = '';
    const input = event.target;
    if (event.key === 'Backspace' && input.value === '' && previousInput) {
      previousInput.focus();
      this.activeInputIndex = index;
    }
  
   
    this.otp = this.otp1 + this.otp2 + this.otp3 + this.otp4 + this.otp5 + this.otp6;
    
    
    this.onOtpChange(this.otp);
  }

  handleOtpPaste(event: ClipboardEvent) {
    this.isPasting = true;
    // console.log('pasteevent :' + event);
    const clipboardData = event.clipboardData;
    const pastedData = clipboardData?.getData('text');
    
    if (pastedData && pastedData.length === 6) {
      this.otp1 = pastedData[0];
      this.otp2 = pastedData[1];
      this.otp3 = pastedData[2];
      this.otp4 = pastedData[3];
      this.otp5 = pastedData[4];
      this.otp6 = pastedData[5];
  
      this.activeInputIndex = 6;  
  

      this.onOtpChange(this.otp1 + this.otp2 + this.otp3 + this.otp4 + this.otp5 + this.otp6);
    }
    this.debounceTimer = setTimeout(() => {
     this.isPasting = false;
    }, 500);
  }
}
