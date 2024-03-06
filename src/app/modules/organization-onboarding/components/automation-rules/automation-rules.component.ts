import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-automation-rules',
  templateUrl: './automation-rules.component.html',
  styleUrls: ['./automation-rules.component.css']
})
export class AutomationRulesComponent implements OnInit {

  constructor(private _location:Location) { }

  ngOnInit(): void {
  }

  back(){
    this._location.back();
  }
}
