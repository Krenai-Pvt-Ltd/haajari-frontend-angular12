import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-document',
  templateUrl: './employee-document.component.html',
  styleUrls: ['./employee-document.component.css']
})
export class EmployeeDocumentComponent implements OnInit {

  constructor(private router : Router) { }

  ngOnInit(): void {
  }
  backRedirectUrl(){
    this.router.navigate(['/employee-address-detail']);
  }
  nextRedirectUrl(){
    this.router.navigate(['/acadmic']);
  }
}
