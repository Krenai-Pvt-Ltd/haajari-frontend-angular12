import { Component, OnInit } from '@angular/core';
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
email: any;
password: any;
  //accessTokensAr: any = localStorage.getItem("accessTokens") || [];
  //accessTokenArray: any = JSON.parse(this.accessTokensAr);

  constructor(private dataService : DataService, private router : Router, private rbacService : RoleBasedAccessControlService, private helperService : HelperService, private authService : AuthService) { }

  ngOnInit(): void {

    const loginData = {id: 1, name: "richa", role: "ADMIN", orgRefId: 1, httpCustomStatus: "UPDATED"};
    localStorage.setItem('loginData', JSON.stringify(loginData));
  }

  loginButtonLoader : boolean = false;
  
  signIn(){
    this.loginButtonLoader = true;
    this.dataService.loginUser(this.email,this.password).subscribe(response =>{
      debugger
      console.log(response);
      this.helperService.moduleResponseList=response.moduleResponseList

      localStorage.setItem('token', response.tokenResponse.access_token);
      localStorage.setItem('refresh_token', response.tokenResponse.refresh_token);
      // this.rbacService.setModules(response.moduleResponseList);
      // this.helperService.setModules(response.moduleResponseList);
      console.log(this.authService.setUserData(response.moduleResponseList));


      this.router.navigate(['/dashboard']);
      
    }, (error) =>{
      console.log(error);
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

}
