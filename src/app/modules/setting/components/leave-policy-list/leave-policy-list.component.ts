import { Component, Input, OnInit } from '@angular/core';
import { LeaveTemplateCategoryRes } from 'src/app/models/LeaveTemplateCategoryRes';

@Component({
  selector: 'app-leave-policy-list',
  templateUrl: './leave-policy-list.component.html',
  styleUrls: ['./leave-policy-list.component.css']
})
export class LeavePolicyListComponent implements OnInit {

  @Input() leaveCategories: LeaveTemplateCategoryRes[] = [];
  constructor() { }

  ngOnInit(): void {
  }

}
