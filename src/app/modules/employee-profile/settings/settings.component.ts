import { Component, OnInit } from '@angular/core';
import { EmployeeProfileComponent } from '../employee-profile.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  constructor(private employeeProfileComponent: EmployeeProfileComponent,) { }

  back(): void{
    this.employeeProfileComponent.firstTab.nativeElement.click();
  }
  ngOnInit(): void {
  }

}
