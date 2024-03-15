import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserReq } from 'src/app/models/userReq';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  confiirmPassword: string = '';
  //accessTokensAr: any = localStorage.getItem("accessTokens") || [];
  //accessTokenArray: any = JSON.parse(this.accessTokensAr);

  constructor(private dataService: DataService,
    private router: Router,
    private rbacService: RoleBasedAccessControlService,
    private helperService: HelperService,
    private _onboardingService: OrganizationOnboardingService) { }

  ngOnInit(): void {

    // const loginData = {id: 1, name: "richa", role: "ADMIN", orgRefId: 1, httpCustomStatus: "UPDATED"};
    // localStorage.setItem('loginData', JSON.stringify(loginData));
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
    if (this.confiirmPassword != this.password) {
      this.confirmPassError = true;
    }
  }

  ROLE: string | null = '';
  UUID: string = '';

  signIn() {
    debugger
    this.loginButtonLoader = true;
    this.dataService.loginUser(this.email, this.password).subscribe(async response => {
      debugger
      console.log(response);
      this.helperService.subModuleResponseList = response.subModuleResponseList;

      localStorage.setItem('token', response.tokenResponse.access_token);
      localStorage.setItem('refresh_token', response.tokenResponse.refresh_token);

      this.ROLE = await this.rbacService.getRole();
      this.UUID = await this.rbacService.getUuid();

      debugger
      if (this.ROLE === 'USER') {
        this.router.navigate(['/employee-profile'], { queryParams: { userId: this.UUID, dashboardActive: 'true' } });
      } else {
        this.router.navigate(['/dashboard']);
      }


      // this.router.navigate(['/dashboard']);

    }, (error) => {
      console.log(error.error.message);
      this.errorMessage = error.error.message;
      // if(this.errorMessage == "OTP sent to your email. Please verify to set your password."){
      //   this.verifyOtpButton=true;
      // }else if(this.errorMessage == "Please Enter Valid Password."){
      //   this.enterPasswordFlag=true;
      // }else if(this.errorMessage == "Invalid login. Please check your credentials."){
      //   this.errorPasswordFlag=true;
      // }
      this.loginButtonLoader = false;
    })
  }


  // signIn(){
  //   this.loginButtonLoader = true;
  //   this.dataService.loginUser(this.email, this.password).subscribe({
  //     next: (response) => {
  //       console.log(response);
  //       this.helperService.subModuleResponseList = response.subModuleResponseList;

  //       localStorage.setItem('token', response.tokenResponse.access_token);
  //       localStorage.setItem('refresh_token', response.tokenResponse.refresh_token);

  //       this.router.navigate(['/dashboard']);
  //     },
  //     error: (error) => {
  //       console.error(error);
  //       this.loginButtonLoader = false;
  //     }
  //   });
  // }


  enableBack: boolean = false;
  signInWithEmail() {
    this.enableBack = true;
    this.isWhatsappLogin = false;
    const res = document.getElementById("mt-3") as HTMLElement | null;
    if (res) {
      res.style.display = "none";
    }

    const res2 = document.getElementById("signin-with-email") as HTMLElement | null;
    if (res2) {
      res2.style.display = "block";
    }
  }

  redirectToRegister() {
    this.router.navigate(['/onboarding']);

  }

  ngAfterViewInit() {
    this.autoplayVideo();
  }

  autoplayVideo() {

    var div = document.getElementById("videoId");
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
    console.log(`Input ${index} changed`);
  }

  @ViewChild('otpInput') otpInput: any;

  createPasswordFlag: boolean = false;
  otpErrorMessage: string = '';
  verifyOtp() {

    debugger
    if (this.isWhatsappLogin) {
      this.verifyOtpByWhatsappMethodCall();
    } else {
      this.dataService.verifyUserOtp(this.email, this.otp)
        .subscribe(
          (response) => {
            this.errorMessage = '';
            this.verifyOtpButtonFlag = false;
            this.otp = '';
            this.createPasswordFlag = true;
            this.showMessageFlag = false;
            this.verifyOtpButtonFlag = false;
            // this.otpVerification.nativeElement.click();
            console.log('Verification successful:', response);
          },
          (error) => {
            this.otpErrorMessage = error.error.message;
            console.error('Verification failed:', error);
          }
        );
    }

  }

  registerPassLoader: boolean = false;
  registerUserPassword() {
    this.registerPassLoader = true;
    this.dataService.registerPassword(this.email, this.password)
      .subscribe(
        (response) => {
          this.registerPassLoader = false;
          console.log('Password Created successfully:', response);
          this.password = '';
          this.confiirmPassword = '';
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
    debugger
    this.checkFormValidation();

    if (this.isFormInvalid == true) {
      return
    } else {
      this.loginButtonLoader = true;
      this.dataService.checkUserPresence(this.email)
        .subscribe(
          (response) => {
            this.loginButtonLoader = false;
            if (response.isExistingUser == false) {
              this.errorMessage = "Please register yourself first Or contact to your admin!";
            }

            if (response.isEnableStatus == false) {
              this.errorMessage = "You are disabled by admin, please contact to your admin!";
            }
            if (response.isPassword == true) {
              this.enterPasswordFlag = true;
              this.errorMessage = '';
            } else if (response.isPassword == false) {
              this.showMessageFlag = true;
              this.verifyOtpButtonFlag = true;
              this.errorMessage = '';
            }
            console.log("response :", response);
          },
          (error) => {
            this.loginButtonLoader = false;
            console.log("error :", error);

          }
        );
    }
  }

  sendUserOtpToMail() {
    this.dataService.sendUserOtpToMail(this.email)
      .subscribe(
        (response) => {
          console.log("response :", response);
        },
        (error) => {
          console.log("error :", error);

        }
      );
  }

  resetUserPassword() {
    this.registerPassLoader = true;
    this.dataService.resetPassword(this.email, this.password)
      .subscribe(
        (response) => {
          this.registerPassLoader = false;
          console.log('Password Created successfully:', response);
          this.password = '';
          this.confiirmPassword = '';
          this.createPasswordFlag = false;
          this.enterPasswordFlag = true;
        },
        (error) => {
          this.registerPassLoader = false;
          console.log("error :", error);

        }
      );

  }




  // password:string='';
  // createPassword() {
  //   this.dataService.registerPassword(this.email, password)
  //     .subscribe(
  //       (response) => {
  //         this.errorMessage = '';
  //         this.verifyOtpButton=false;
  //         this.otp = 0;
  //         this.createPasswordFlag=true;
  //         this.otpVerification.nativeElement.click();
  //         console.log('Verification successful:', response);
  //       },
  //       (error) => {
  //         console.error('Verification failed:', error);
  //       }
  //     );
  // }

  onOtpChange(event: any) {
    this.otp = event;
    console.log('OTP changed:', this.otp);
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
    // this.createPasswordFlag=true;
    this.enterPasswordFlag = false;
    // this.resetPasswordFlag=true;
    this.verifyOtpButtonFlag = true;
  }


  @ViewChild('otpVerificationModalButton') otpVerificationModalButton !: ElementRef
  isWhatsappLogin: boolean = false;
  phoneNumber: string = '';
  showOtpInput: boolean = false
  sendOtpLoader: boolean = false;
  signInByWhatsappMethodCall() {
    debugger
    this.sendOtpLoader = true;
    this.checkFormValidation();

    if (this.isFormInvalid == true) {
      return
    } else {
      this.dataService.signInByWhatsappNew(this.phoneNumber).subscribe((response: any) => {
        if (response.status) {
          this.sendOtpLoader = false;
          this.showOtpInput = true;
          console.log('OTP sent successfully:', response);
        }
      },(error) => {
          console.log("error :", error);
        }
      );
    }
  }

  @ViewChild('closeOtpVerifyModal') closeOtpVerifyModal!: ElementRef;

  loading: boolean = false;
  verifyOtpByWhatsappMethodCall() {
    debugger
    this.loading = true;
    this.dataService.verifyOtpByWhatsappNew(this.phoneNumber, this.otp).subscribe((response: any) => {
      if (response.status) {
        this.loading = false;
        this.helperService.subModuleResponseList = response.object.subModuleResponseList;
        localStorage.setItem('token', response.object.tokenResponse.access_token);
        localStorage.setItem('refresh_token', response.object.tokenResponse.refresh_token);
        const helper = new JwtHelperService();
        const onboardingStep = helper.decodeToken(response.object.tokenResponse.access_token).statusResponse;
        const role = helper.decodeToken(response.object.tokenResponse.access_token).role;
        if (role == "ADMIN") {
          if (onboardingStep == "6") {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/organization-onboarding/personal-information']);
          }
        } else {
          this.router.navigate(['/dashboard']);
        }


      } else {

        this.userReq.phone = this.phoneNumber;
        this._onboardingService.createAdminNew(this.userReq).subscribe((response: any) => {
          if (response.status) {
            this.loading = false;
            this.helperService.subModuleResponseList = response.object.subModuleResponseList;
            localStorage.setItem('token', response.object.tokenResponse.access_token);
            localStorage.setItem('refresh_token', response.object.tokenResponse.refresh_token);

            const helper = new JwtHelperService();
            const onboardingStep = helper.decodeToken(response.object.tokenResponse.access_token).statusResponse;
            const role = helper.decodeToken(response.object.tokenResponse.access_token).role;
            if (role == "ADMIN") {
              if (onboardingStep == "6") {
                this.router.navigate(['/dashboard']);
              } else {
                this.router.navigate(['/organization-onboarding/personal-information']);
              }
            } else {
              this.router.navigate(['/dashboard']);
            }
          }
          this.loading = false;
        }, (error) => {
          this.loading = false;
        })
      }
    },
      (error) => {
        this.otpErrorMessage = error.error.message;
        this.loading = false;
      }
    );
  }


  signInWithWhatsapp() {
    debugger

    this.enableBack = true;
    this.isWhatsappLogin = true;
    const res = document.getElementById("mt-3") as HTMLElement | null;
    if (res) {
      res.style.display = "none";
    }

  }

  isFormInvalid: boolean = false;
  @ViewChild('loginForm') loginForm !: NgForm
  checkFormValidation() {
    if (this.loginForm.invalid) {
      this.isFormInvalid = true;
      return
    } else {
      this.isFormInvalid = false;
    }
  }


  @ViewChild('userCreateModal') userCreateModal!: ElementRef;
  @ViewChild('closeUserCreateModal') closeUserCreateModal!: ElementRef;
  userReq: UserReq = new UserReq();
  createLoader: boolean = false;

}
