import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-holiday-setting',
  templateUrl: './holiday-setting.component.html',
  styleUrls: ['./holiday-setting.component.css']
})
export class HolidaySettingComponent implements OnInit {

  constructor(private _location:Location) { }

  ngOnInit(): void {
  }

  back(){
    this._location.back();
  }

}
