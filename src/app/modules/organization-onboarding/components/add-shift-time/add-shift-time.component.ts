import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { OrganizationShiftTimingRequest } from 'src/app/models/organization-shift-timing-request';
import { ShiftType } from 'src/app/models/shift-type';
import { Staff } from 'src/app/models/staff';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-add-shift-time',
  templateUrl: './add-shift-time.component.html',
  styleUrls: ['./add-shift-time.component.css']
})
export class AddShiftTimeComponent implements OnInit {

  constructor(private dataService: DataService,
    private router: Router,
    private _location:Location) { }

  ngOnInit(): void {
    
    this.getShiftTypeMethodCall();
    this.getUserByFiltersMethodCall();
  }

  backPage() {
    this._location.back();
  }

  
  shiftTypeList: ShiftType[] = [];
  getShiftTypeMethodCall() {
    this.dataService.getAllShiftType().subscribe((response) => {
      this.shiftTypeList = response;
      // console.log(response);
    }, (error) => {
      console.log(error);
    })
  }

  itemPerPage: number = 8;
  pageNumber: number = 1;
  total !: number;
  rowNumber: number = 1;
  searchText: string = '';
  staffs: Staff[] = [];
  selectedStaffsUuids: string[] = [];
  selectedStaffs: Staff[] = [];
  isAllSelected: boolean = false;

  getUserByFiltersMethodCall() {
    this.dataService.getUsersByFilter(this.itemPerPage, this.pageNumber, 'asc', 'id', this.searchText, '').subscribe((response) => {
      this.staffs = response.users.map((staff: Staff) => ({
        ...staff,
        selected: this.selectedStaffsUuids.includes(staff.uuid)
      }));
      this.total = response.count;

      this.isAllSelected = this.staffs.every(staff => staff.selected);
    }, (error) => {
      console.error(error);
    });
  }

  @ViewChild("shiftTimingActiveTab") shiftTimingActiveTab !: ElementRef;
  organizationShiftTimingRequest: OrganizationShiftTimingRequest = new OrganizationShiftTimingRequest();
  selectedShiftType: ShiftType = new ShiftType();

}
