import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
// import { CookieService } from 'ngx-cookie-service';
import { DataService } from 'src/app/services/data.service';


@Component({
  selector: 'app-slack-auth',
  templateUrl: './slack-auth.component.html',
  styleUrls: ['./slack-auth.component.css'],
})
export class SlackAuthComponent implements OnInit{

   orgId : any;
   accessToken : any;
  // ide !:number;
  //  @Input() getIdFromOboard : any;
  constructor(private dataService : DataService, private httpClient : HttpClient){}
  ngOnInit(): void {
    debugger
    // this.dataService.getOrgIdEmitter().subscribe((orgId) => {
    //   console.log('Org ID received in SlackAuthComponent:', orgId);
    //   this.orgId = orgId;
    //   this.saveToken(this.orgId);
    // });
    
    if (localStorage.getItem('orgId') != undefined && localStorage.getItem('orgId') != null && localStorage.getItem('orgId') != '') {
      this.orgId = localStorage.getItem('orgId');
      // this.dataService.orgId = this.id;
    }
    this.convertAccessTokenFromCode(this.orgId);
    
    // this.saveToken(this.orgId);
  }
  
  convertAccessTokenFromCode(orgI : any){
    debugger
    const codeParam = new URLSearchParams(window.location.search).get('code');
    if (!codeParam) {
      alert('Invalid URL: Missing code parameter');
      return;
    }

    this.dataService.getAccessToken(codeParam).subscribe((response : any)=>{
      // console.log(response.body);
      this.accessToken = (JSON.parse(response.body)).access_token; 
      // console.log(token);
      this.saveToken(this.accessToken, orgI);
    }, (error:any)=>{
      console.log('error fetching');
    });

  }


  saveToken(token : string, orgID : number): void {
    
   
    // console.log(this.orgId);
    debugger
    if (!this.orgId) {
      alert('Organization ID not found');
      return;
    }
    
  this.dataService.saveTokenForOrganization(token, this.orgId)
    .subscribe(
      (response: any) => {
        console.log('Token saved:', response);

      },
      (error: any) => {
        console.error('Error saving token:', error);
      }
    );
  }
}
