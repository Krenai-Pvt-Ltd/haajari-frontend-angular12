import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
email:string= '';
password: string='';
confiirmPassword: string='';
  //accessTokensAr: any = localStorage.getItem("accessTokens") || [];
  //accessTokenArray: any = JSON.parse(this.accessTokensAr);

  constructor(private dataService : DataService, private router : Router, private rbacService : RoleBasedAccessControlService, private helperService : HelperService, private authService : AuthService) { }

  ngOnInit(): void {

    // const loginData = {id: 1, name: "richa", role: "ADMIN", orgRefId: 1, httpCustomStatus: "UPDATED"};
    // localStorage.setItem('loginData', JSON.stringify(loginData));
  }

  otp : number=0;
  loginButtonLoader : boolean = false;
  errorMessage: string = ''; 
  verifyOtpButton: boolean = false;

  confirmPassError:boolean=false;
  checkConfirmPassword(){
    this.confirmPassError = false;
    if(this.confiirmPassword!=this.password){
      this.confirmPassError = true;
    }
  }

  signIn(){
    debugger
    this.loginButtonLoader = true;
    this.dataService.loginUser(this.email, this.password).subscribe(response =>{
      debugger
      console.log(response);
      this.helperService.subModuleResponseList=response.subModuleResponseList;

      localStorage.setItem('token', response.tokenResponse.access_token);
      localStorage.setItem('refresh_token', response.tokenResponse.refresh_token);
      // this.rbacService.setModules(response.moduleResponseList);
      // this.helperService.setModules(response.moduleResponseList);

      this.router.navigate(['/dashboard']);
      
    }, (error) =>{
      console.log(error.error.message);
      this.errorMessage = error.error.message; 
      if(this.errorMessage == "OTP sent to your email. Please verify to set your password."){
        this.verifyOtpButton=true;
      }
      this.loginButtonLoader = false;
    })
  }

  enableBack:boolean=false;
  signInWithEmail(){
    this.enableBack=true;
    const res = document.getElementById("mt-3") as HTMLElement | null;
    if(res){
      res.style.display="none";
    }

    const res2 = document.getElementById("signin-with-email") as HTMLElement | null;
    if(res2){
      res2.style.display="block";
    }
  }

  redirectToRegister(){
    this.router.navigate(['/onboarding']);

  }

  ngAfterViewInit(){
    this.autoplayVideo();
  }

  autoplayVideo(){

    var div= document.getElementById("videoId");
    if(div){
    
     

        //@ts-ignore
        div!.muted = true;
  //@ts-ignore
        div.autoplay=true;
         //@ts-ignore
      div!.play();
    } 
  }


  onOtpInputChange(index: number) {
    console.log(`Input ${index} changed`);
  }

  createPasswordFlag:boolean=false;
  verifyOtp() {
    this.dataService.verifyUserOtp(this.email,this.otp)
      .subscribe(
        (response) => {
          this.errorMessage = '';
          this.verifyOtpButton=false;
          this.otp = 0;
          this.createPasswordFlag=true;
          this.otpVerification.nativeElement.click();
          console.log('Verification successful:', response);
        },
        (error) => {
          console.error('Verification failed:', error);
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


}
