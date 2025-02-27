import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-statutory',
  templateUrl: './statutory.component.html',
  styleUrls: ['./statutory.component.css']
})
export class StatutoryComponent implements OnInit {

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
