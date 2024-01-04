import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css']
})
export class AccountSettingsComponent implements OnInit {

  constructor(private _routeParam:ActivatedRoute,
    public _data:DataService) { 
    // this._routeParam.queryParams.subscribe(
    //   (params:Params)=>{   
    //     this.tabName = params['tab'];
    //     console.log("tabname", this.tabName)   
    // });

  }

  @ViewChild('account')account!:ElementRef; 
  @ViewChild('refer')refer!:ElementRef;
  tabName:string='';
  ngOnInit(): void {
    
  }

  ngAfterViewInit(){
    if(this._data.activeTab){
      this.refer.nativeElement.click();
     }else{
      this.account.nativeElement.click();
       
     }
  }
}
