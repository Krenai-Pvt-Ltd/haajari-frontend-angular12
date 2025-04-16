import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-employee-changes',
  templateUrl: './employee-changes.component.html',
  styleUrls: ['./employee-changes.component.css']
})
export class EmployeeChangesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  collapseStates = Array(4).fill(false);
}
