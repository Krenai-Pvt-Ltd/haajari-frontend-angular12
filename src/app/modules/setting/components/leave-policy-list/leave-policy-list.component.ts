import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LeaveTemplateCategoryRes } from 'src/app/models/LeaveTemplateCategoryRes';

@Component({
  selector: 'app-leave-policy-list',
  templateUrl: './leave-policy-list.component.html',
  styleUrls: ['./leave-policy-list.component.css']
})
export class LeavePolicyListComponent implements OnInit {

  @Input() leaveCategories: LeaveTemplateCategoryRes[] = [];
  @Output() leaveCategoryDel = new EventEmitter<number>();
  constructor() { }

  ngOnInit(): void {
  }

  selectCategory(id: number): void {
    console.log('Selected category ID:', id);
    try {
      if (id <= 0) {
        throw new Error('Invalid category ID');
      }
      this.leaveCategoryDel.emit(id);
    } catch (error) {
      console.error('Error emitting category ID:', error);
    }
  }
}
