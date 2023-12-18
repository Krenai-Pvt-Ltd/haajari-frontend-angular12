import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-employee-document',
  templateUrl: './employee-document.component.html',
  styleUrls: ['./employee-document.component.css']
})
export class EmployeeDocumentComponent implements OnInit {

  constructor(private router : Router, private dataService : DataService) { }

  ngOnInit(): void {
  }
  
  backRedirectUrl(){
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/employee-address-detail'], navExtra);
  }

  userDocumentsStatus = "";

  nextRedirectUrl(){
    // this.router.navigate(['/acadmic']);
    this.dataService.markStepAsCompleted(2);
  }

  routeToUserDetails() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/acadmic'], navExtra);
  }
}
