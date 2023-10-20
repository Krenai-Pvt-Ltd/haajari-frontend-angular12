import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Organization } from 'src/app/models/organization';
// import { CookieService } from 'ngx-cookie-service';
import { DataService } from 'src/app/services/data.service';


@Component({
  selector: 'app-slack-auth',
  templateUrl: './slack-auth.component.html',
  styleUrls: ['./slack-auth.component.css'],
})
export class SlackAuthComponent implements OnInit{

  //  accessToken : any;
  //  webhook : any;
  //  name : any;
  organization : Organization = new Organization();
  // ide !:number;
  //  @Input() getIdFromOboard : any;
  constructor(private dataService : DataService, private httpClient : HttpClient, private router : Router){}
  ngOnInit(): void {
    debugger
    // this.dataService.getOrgIdEmitter().subscribe((orgId) => {
    //   console.log('Org ID received in SlackAuthComponent:', orgId);
    //   this.orgId = orgId;
    //   this.saveToken(this.orgId);
    // });
    
    if (localStorage.getItem('orgId') != undefined && localStorage.getItem('orgId') != null && localStorage.getItem('orgId') != '') {
      // this.orgId = localStorage.getItem('orgId');
      // this.dataService.orgId = this.id;
    }
    this.convertAccessTokenFromCode();
    // this.saveToken(this.orgId);
  }
  
  convertAccessTokenFromCode(){
    debugger
    const codeParam = new URLSearchParams(window.location.search).get('code');
    if (!codeParam) {
      alert('Invalid URL: Missing code parameter');
      return;
    }

    this.dataService.getAccessToken(codeParam).subscribe((response : any)=>{
      // console.log(response.body);
      const jsonData = (JSON.parse(response.body))
      this.organization.appId = jsonData.app_id;
      this.organization.token = jsonData.access_token;
      this.organization.webhook = jsonData.incoming_webhook.url;  
      this.organization.name = jsonData.team.name;

      // console.log(token);
      this.saveToken(this.organization);
    }, (error:any)=>{
      console.log('error fetching');
    });

  }


  saveToken(organization : Organization) {
    debugger
   this.dataService.saveTokenForOrganization(organization).subscribe((response: any) => {
        debugger
        console.log('Token saved:', response);
        const id = response.id;
        localStorage.setItem('id', id.toString());
      },
      (error: any) => {
        console.error('Error saving token:', error);
      }
    );
  }

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
