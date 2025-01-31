import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-employee-exit',
  templateUrl: './employee-exit.component.html',
  styleUrls: ['./employee-exit.component.css']
})
export class EmployeeExitComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Input() exitDate: any;

}
