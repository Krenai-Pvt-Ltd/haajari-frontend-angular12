import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css'],
})
export class SubscriptionComponent implements OnInit {
  planSwitch: boolean = false;
  RulesRegulation: boolean = false;
  constructor() {}

  ngOnInit(): void {}

  switchSubscriptionPlan() {
    this.planSwitch = this.planSwitch == true ? false : true;
  }
  switchRulesRegulation() {
    this.RulesRegulation = this.RulesRegulation == true ? false : true;
  }
}
