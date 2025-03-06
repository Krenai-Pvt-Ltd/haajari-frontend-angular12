import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-benefit-details',
  templateUrl: './benefit-details.component.html',
  styleUrls: ['./benefit-details.component.css']
})
export class BenefitDetailsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  selectedPfWage = "12% of Actual PF Wage"; // Default selected value

  employer = [
    { label: "12% of Actual PF Wage", value: "12% of Actual PF Wage" },
    { label: "10% of Actual PF Wage", value: "10% of Actual PF Wage" }
  ];
  employee = [
    { label: "12% of Actual PF Wage", value: "12% of Actual PF Wage" },
    { label: "10% of Actual PF Wage", value: "10% of Actual PF Wage" }
  ];
}
