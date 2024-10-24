import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-employee-document',
  templateUrl: './employee-document.component.html',
  styleUrls: ['./employee-document.component.css']
})
export class EmployeeDocumentComponent implements OnInit {

  uploadDoucument: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
