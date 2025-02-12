import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-expense-management',
  templateUrl: './expense-management.component.html',
  styleUrls: ['./expense-management.component.css']
})
export class ExpenseManagementComponent implements OnInit {

  constructor() { }

  showFilter: boolean = false;

  ngOnInit(): void {
  }

  changeShowFilter(flag : boolean) {
    this.showFilter = flag;
  }


}
