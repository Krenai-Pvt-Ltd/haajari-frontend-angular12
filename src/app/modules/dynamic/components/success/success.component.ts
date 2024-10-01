import { Component, OnInit } from '@angular/core';
import { Invoices } from 'src/app/models/Invoices';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css'],
})
export class SuccessComponent implements OnInit {
  invoices: Invoices = new Invoices();

  constructor(private _subscriptionPlanService: SubscriptionPlanService) {}

  ngOnInit(): void {
    window.scroll(0, 0);
    this.getLastInvoice();
  }

  getLastInvoice() {
    this._subscriptionPlanService.getLastInvoices().subscribe((response) => {
      if (response.status) {
        // console.log(response.object);

        this.invoices = response.object;
      }
    });
  }
}
