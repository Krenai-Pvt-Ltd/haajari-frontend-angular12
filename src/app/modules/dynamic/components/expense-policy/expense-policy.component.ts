import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-expense-policy',
  templateUrl: './expense-policy.component.html',
  styleUrls: ['./expense-policy.component.css']
})
export class ExpensePolicyComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  showPolicyList: boolean = false;

  stateList=[
    { "id": 1, "name": "Andhra Pradesh" },
    { "id": 2, "name": "Arunachal Pradesh" },
    { "id": 3, "name": "Assam" },
    { "id": 4, "name": "Bihar" },
    { "id": 5, "name": "Chhattisgarh" },
    { "id": 6, "name": "Goa" },
    { "id": 7, "name": "Gujarat" },
    { "id": 8, "name": "Haryana" },
    { "id": 9, "name": "Himachal Pradesh" },
    { "id": 10, "name": "Jharkhand" },
    { "id": 11, "name": "Karnataka" },
    { "id": 12, "name": "Kerala" },
    { "id": 13, "name": "Madhya Pradesh" },
    { "id": 14, "name": "Maharashtra" },
    { "id": 15, "name": "Manipur" },
    { "id": 16, "name": "Meghalaya" },
    { "id": 17, "name": "Mizoram" },
    { "id": 18, "name": "Nagaland" },
    { "id": 19, "name": "Odisha" },
    { "id": 20, "name": "Punjab" },
    { "id": 21, "name": "Rajasthan" },
    { "id": 22, "name": "Sikkim" },
    { "id": 23, "name": "Tamil Nadu" },
    { "id": 24, "name": "Telangana" },
    { "id": 25, "name": "Tripura" },
    { "id": 26, "name": "Uttar Pradesh" },
    { "id": 27, "name": "Uttarakhand" },
    { "id": 28, "name": "West Bengal" }
  ]


  expenses: any[] = [
    {
      id: 1,
      expenseType: 'Office Supplies',
      paymentType: 'Fixed',
      amount: 3000,
      flexibleAmount: '300%'
    },
    {
      id: 2,
      expenseType: 'Office Supplies',
      paymentType: 'Flexible',
      amount: 3000,
      flexibleAmount: '300%'
    }
  ];

  deleteExpense(id: number) {
    this.expenses = this.expenses.filter(expense => expense.id !== id);
  }

  editExpense(id: number) {
    console.log('Editing expense with ID:', id);
    // Implement your editing logic here
  }
  togglePolicyList() {
    this.showPolicyList = !this.showPolicyList;
  }
}
