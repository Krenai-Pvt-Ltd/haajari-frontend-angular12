import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SalaryCalculationMode } from 'src/app/models/salary-calculation-mode';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-salary-setting',
  templateUrl: './salary-setting.component.html',
  styleUrls: ['./salary-setting.component.css']
})
export class SalarySettingComponent implements OnInit {

  constructor(private dataService : DataService) { }

  ngOnInit(): void {
    this.getAllSalaryCalculationModeMethodCall();
    this.getSalaryCalculationModeByOrganizationIdMethodCall();
  }


  switchValueForPF = false;
  switchValueForESI = false;
  switchValueForProfessionalTax = false;


  isShimmerForSalaryCalculationMode = false;
  dataNotFoundPlaceholderForSalaryCalculationMode = false;
  networkConnectionErrorPlaceHolderForSalaryCalculationMode = false;
  preRuleForShimmersAndErrorPlaceholdersForSalaryCalculationModeMethodCall(){
    this.isShimmerForSalaryCalculationMode = true;
    this.dataNotFoundPlaceholderForSalaryCalculationMode = false;
    this.networkConnectionErrorPlaceHolderForSalaryCalculationMode = false;
  }
  

  salaryCalculationModeList : SalaryCalculationMode[] = [];
  getAllSalaryCalculationModeMethodCall(){
    this.preRuleForShimmersAndErrorPlaceholdersForSalaryCalculationModeMethodCall();
    this.dataService.getAllSalaryCalculationMode().subscribe((response) => {

      if(response == null || response == undefined || response.listOfObject == null || response.listOfObject == undefined || response.listOfObject.length == 0){
        this.dataNotFoundPlaceholderForSalaryCalculationMode = true;
        return;
      }
      this.salaryCalculationModeList = response.listOfObject;
    }, (error) => {
      this.networkConnectionErrorPlaceHolderForSalaryCalculationMode = true;
    })
  }


  selectedSalaryCalculationModeId : number = 0;
  getSalaryCalculationModeByOrganizationIdMethodCall(){
    debugger
    this.dataService.getSalaryCalculationModeByOrganizationId().subscribe((response) => {
      debugger
      this.selectedSalaryCalculationModeId = response.object.id;
      this.getAllSalaryCalculationModeMethodCall();
    }, (error) => {
      
    })
  }

  updateSalaryCalculationMode(a : any){

  }

  @ViewChild("deleteConfirmationModal") deleteConfirmationModal !: ElementRef;

  

}

