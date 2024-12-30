import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { Routes } from 'src/app/constant/Routes';
import { HelperService } from 'src/app/services/helper.service';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit {

  readonly key = Key;
  readonly Routes=Routes;
  constructor(public _router: Router,
      private _helperService: HelperService, public roleBasedAccessControlService: RoleBasedAccessControlService,
       public onboardingService : OnboardingService, public helperService : HelperService){
  }

  ngOnInit(): void {
  }

}
