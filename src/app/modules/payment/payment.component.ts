import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  readonly key = Key;
  _router : any;
  constructor(private router: Router, public roleBasedAccessControlService : RoleBasedAccessControlService,
    private _dataService : DataService, private _helperService : HelperService
  ){
    this._router = router;
  }


  ngOnInit(): void {
    this._helperService.getOrganizationRegistrationDateMethodCall();
  }


  
}
