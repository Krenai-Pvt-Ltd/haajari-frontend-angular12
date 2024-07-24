import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-organization-onboarding',
  templateUrl: './organization-onboarding.component.html',
  styleUrls: ['./organization-onboarding.component.css']
})
export class OrganizationOnboardingComponent implements OnInit {

  readonly key = Key;
  _router : any;
  constructor(private router: Router,
    private _helperService: HelperService, public roleBasedAccessControlService: RoleBasedAccessControlService){
    this._router = router;
  }

  ngOnInit(): void {
    
  }


}
