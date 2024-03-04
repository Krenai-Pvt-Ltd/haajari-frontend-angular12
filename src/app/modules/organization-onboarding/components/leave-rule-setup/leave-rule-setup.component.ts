import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-leave-rule-setup',
  templateUrl: './leave-rule-setup.component.html',
  styleUrls: ['./leave-rule-setup.component.css']
})
export class LeaveRuleSetupComponent implements OnInit {

  constructor(private _router:Router) { }

  ngOnInit(): void {
  }

  
skipLeaveSetting(){
  this._router.navigate(['/organization-onboarding/holiday-setting']);
}

}
