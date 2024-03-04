import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-leave-setting-create',
  templateUrl: './leave-setting-create.component.html',
  styleUrls: ['./leave-setting-create.component.css']
})
export class LeaveSettingCreateComponent implements OnInit {

  constructor(private _location:Location) {}

  ngOnInit(): void {
  }

  back(){
    this._location.back();
  }

}
