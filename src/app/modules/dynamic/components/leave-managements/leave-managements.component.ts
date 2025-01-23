import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-leave-managements',
  templateUrl: './leave-managements.component.html',
  styleUrls: ['./leave-managements.component.css']
})
export class LeaveManagementsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  tab: string = 'absent';
  switchTab(tab: string) {
    this.tab = tab
  }

}
