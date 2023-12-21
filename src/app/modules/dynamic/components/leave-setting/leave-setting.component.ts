import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-leave-setting',
  templateUrl: './leave-setting.component.html',
  styleUrls: ['./leave-setting.component.css']
})
export class LeaveSettingComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  leaveSettingPlaceholder:boolean=false;

}
