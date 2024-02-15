import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-organization-personal-information',
  templateUrl: './organization-personal-information.component.html',
  styleUrls: ['./organization-personal-information.component.css']
})
export class OrganizationPersonalInformationComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  preventLeadingWhitespace(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;
  
    // Prevent space if it's the first character
    if (event.key === ' ' && inputElement.value.length === 0) {
      event.preventDefault();
  }
    // if (!isNaN(Number(event.key)) && event.key !== ' ') {
    //   event.preventDefault();
    // }
  }

  preventLeadingWhitespaceAndNumber(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;
  
    // Prevent space if it's the first character
    if (event.key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
    if (!isNaN(Number(event.key)) && event.key !== ' ') {
      event.preventDefault();
    }
  }

  
  isFormInvalid: boolean = false;
  @ViewChild ('personalInformationForm') personalInformationForm !: NgForm
checkFormValidation(){
  if(this.personalInformationForm.invalid){
  this.isFormInvalid = true;
  return
  } else {
    this.isFormInvalid = false;
  }
}

submit(){
  this.checkFormValidation();

  if(this.isFormInvalid==true){
    return
  } else{
  }
}
}
