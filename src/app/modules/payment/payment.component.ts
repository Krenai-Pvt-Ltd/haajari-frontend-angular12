import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  readonly key = Key;
  _router : any;
  constructor(private router: Router){
    this._router = router;
  }

  ngOnInit(): void {
  }

  

}
