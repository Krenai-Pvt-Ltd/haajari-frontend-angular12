import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-statutory-deduction',
  templateUrl: './statutory-deduction.component.html',
  styleUrls: ['./statutory-deduction.component.css']
})
export class StatutoryDeductionComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  showDeductionDetail: boolean = false;
  toggleDeductionList() {
    this.showDeductionDetail = !this.showDeductionDetail;
  }

}
