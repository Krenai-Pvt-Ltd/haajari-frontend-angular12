import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-to-do-step-dashboard',
  templateUrl: './to-do-step-dashboard.component.html',
  styleUrls: ['./to-do-step-dashboard.component.css'],
})
export class ToDoStepDashboardComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  showToDoStep: boolean = true;
  showToDoStepModal: boolean = false;
  showToDoStepTab: boolean = false;

  hideToDoStep() {
    this.showToDoStep = false;
    this.showToDoStepTab = true;
  }
}