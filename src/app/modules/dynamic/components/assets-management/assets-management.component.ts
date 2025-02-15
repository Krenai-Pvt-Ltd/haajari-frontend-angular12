import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-assets-management',
  templateUrl: './assets-management.component.html',
  styleUrls: ['./assets-management.component.css']
})
export class AssetsManagementComponent implements OnInit {

  constructor() { }
  showFilter: boolean = false;
  assetsList: boolean[] = [false];
  ngOnInit(): void {
  }

  changeShowFilter(flag : boolean) {
    this.showFilter = flag;
  }

}
