import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css']
})
export class AccountSettingsComponent implements OnInit {

  constructor(private _routeParam:ActivatedRoute) { 


    if(this._routeParam.snapshot.queryParamMap.has('tab') ){
      var tabName= this._routeParam.snapshot.queryParamMap.get('tab');
      if(tabName){
        this.tabName = tabName;
      }
      console.log("tabname", this.tabName)   
    }
  }

  tabName:string='';
  ngOnInit(): void {
  }

}
