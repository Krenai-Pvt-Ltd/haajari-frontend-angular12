import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

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

  constructor(private dataService : DataService, private router : Router) { }

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

      localStorage.setItem('token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);

      this.router.navigate(['/dashboard']);
      
    }, (error) =>{
      console.log(error);
      this.loginButtonLoader = false;
    })
  }

  signInWithEmail(){

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
