import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-subscription-ended',
  templateUrl: './subscription-ended.component.html',
  styleUrls: ['./subscription-ended.component.css']
})
export class SubscriptionEndedComponent implements OnInit {

  constructor(private _router:Router) { }

  ngOnInit(): void {
  }

  routeToSubscription(){
    this._router.navigate(['/setting/subscription']);
  }

}
