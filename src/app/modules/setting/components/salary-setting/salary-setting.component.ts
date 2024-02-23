import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { PFContributionRate } from 'src/app/models/p-f-contribution-rate';
import { SalaryCalculationMode } from 'src/app/models/salary-calculation-mode';
import { Statutory } from 'src/app/models/statutory';
import { StatutoryAttribute } from 'src/app/models/statutory-attribute';
import { StatutoryRequest } from 'src/app/models/statutory-request';
import { ConfirmationDialogService } from 'src/app/services/confirmation-dialog.service';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-salary-setting',
  templateUrl: './salary-setting.component.html',
  styleUrls: ['./salary-setting.component.css']
})
export class SalarySettingComponent implements OnInit {

  constructor(private dataService : DataService, private helperService : HelperService, private confirmationDialogService : ConfirmationDialogService) { }

  ngOnInit(): void {
    this.getAllSalaryCalculationModeMethodCall();
    this.getSalaryCalculationModeByOrganizationIdMethodCall();
    this.getPFContributionRateMethodCall();
    this.getAllStatutoriesMethodCall();
  }


  //Code for toggle buttons in statutories section
  switchValueForPF = false;
  switchValueForESI = false;
  switchValueForProfessionalTax = false;

  EPF_ID = 1;
  ESI_ID = 2;
  PROFESSIONAL_TAX_ID = 3;

  turnOnTheToggle(statutory : Statutory, state: boolean){

    if(statutory.id == this.EPF_ID){
      this.switchValueForPF = true;
    } else if(statutory.id == this.ESI_ID){
      this.switchValueForESI = true;
    } else if(statutory.id == this.PROFESSIONAL_TAX_ID){
      this.switchValueForProfessionalTax = true;
    }

    this.getStatutoryAttributeByStatutoryIdMethodCall(statutory.id);
    this.statutoryRequest.id = statutory.id;
    this.statutoryRequest.name = statutory.name;
    this.statutoryRequest.switchValue = true;
  }
  

  UNRESTRICTED_PF_WAGE = Key.UNRESTRICTED_PF_WAGE;
  RESTRICTED_PF_WAGE_UPTO_15000 = Key.RESTRICTED_PF_WAGE_UPTO_15000;


  //Code for shimmers and placeholders
  isShimmerForSalaryCalculationMode = false;
  dataNotFoundPlaceholderForSalaryCalculationMode = false;
  networkConnectionErrorPlaceHolderForSalaryCalculationMode = false;
  preRuleForShimmersAndErrorPlaceholdersForSalaryCalculationModeMethodCall(){
    this.isShimmerForSalaryCalculationMode = true;
    this.dataNotFoundPlaceholderForSalaryCalculationMode = false;
    this.networkConnectionErrorPlaceHolderForSalaryCalculationMode = false;
  }
  

  //Fetching all the salary calculation mode from the database
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


  //Fetching the salary calculation mode by organization
  selectedSalaryCalculationModeId : number = 0;
  getSalaryCalculationModeByOrganizationIdMethodCall(){
    debugger
    this.preRuleForShimmersAndErrorPlaceholdersForSalaryCalculationModeMethodCall();
    this.dataService.getSalaryCalculationModeByOrganizationId().subscribe((response) => {
      debugger
      this.selectedSalaryCalculationModeId = response.object.id;
      this.getAllSalaryCalculationModeMethodCall();
    }, (error) => {
      
    })
  }


  //Updating the salary calculation mode
  updateSalaryCalculationModeMethodCall(salaryCalculationModeId : number){
    debugger
    this.confirmationDialogService.openConfirmDialog(
      () => this.proceedUpdateSalaryCalculationMode(salaryCalculationModeId),
      () => this.cancelSalaryCalculationModeUpdation()
    );
  }
  proceedUpdateSalaryCalculationMode(salaryCalculationModeId : number) {
    this.dataService.updateSalaryCalculationMode(salaryCalculationModeId).subscribe((response) => {
      this.getSalaryCalculationModeByOrganizationIdMethodCall();
      this.helperService.showToast("Salary calculation mode updated successfully.", Key.TOAST_STATUS_SUCCESS);
    }, (error) => {
      console.log(error);
      this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
    })
  }
  cancelSalaryCalculationModeUpdation() {
    console.log("Cancel check!")
  }


  //Fetching the PF contribution rates from the database
  pFContributionRateList : PFContributionRate[] = [];
  getPFContributionRateMethodCall(){
    this.dataService.getPFContributionRate().subscribe((response) => {
      this.pFContributionRateList = response.listOfObject;
      console.log(response.listOfObject);
    }, (error) =>{

    })
  }

  //Fetching the statutories from the database
  statutoryList : Statutory[] = [];
  getAllStatutoriesMethodCall(){
    this.dataService.getAllStatutories().subscribe((response) => {
      this.statutoryList = response.listOfObject;
    }, (error) => {

    })
  }

  selectedPFContributionRateForEmployees : PFContributionRate = {
    id: 1,
    name: '12% of PF Wage (Unrestricted)',
    description: ''
  };
  selectPFContributionRateForEmployees(pFContributionRate: PFContributionRate) {
    this.selectedPFContributionRateForEmployees = pFContributionRate;
  }

  selectedPFContributionRateForEmployers: PFContributionRate = {
    id: 1,
    name: '12% of PF Wage (Unrestricted)',
    description: ''
  };

  selectPFContributionRateForEmployers(pFContributionRate: PFContributionRate) {
    this.selectedPFContributionRateForEmployers = pFContributionRate;
  }


  statutoryRequest : StatutoryRequest = new StatutoryRequest();
  enableOrDisableStatutoryMethodCall(){
    this.dataService.enableOrDisableStatutory(this.statutoryRequest).subscribe((response) => {
      this.helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
    }, (error) => {
      this.helperService.showToast("Error in updating "+this.statutoryRequest.name, Key.TOAST_STATUS_ERROR);
    })
  }


  //Fetching statutory's attributes
  statutoryAttributeList : StatutoryAttribute[] = [];
  getStatutoryAttributeByStatutoryIdMethodCall(statutoryId : number){
    this.dataService.getStatutoryAttributeByStatutoryId(statutoryId).subscribe((response) => {
      this.statutoryAttributeList = response.listOfObject;
      if (this.pFContributionRateList.length > 0) {
        const defaultPFContributionRate = this.pFContributionRateList[0];
        this.statutoryAttributeList.forEach(attr => {
          attr.selectedRate = defaultPFContributionRate;
        });
      }
    }, (error) => {

    })
  }

  //Disable other inputs if Employer's PF Contribution input is selected as Unirestricted
  inputsDisabled: boolean = true;
  selectPFContributionRate(statutoryAttribute: StatutoryAttribute, pFContributionRate: PFContributionRate, index : number) {
    
    statutoryAttribute.selectedRate = pFContributionRate;

    console.log(this.statutoryAttributeList);

    if (index === 0 && this.pFContributionRateList.indexOf(pFContributionRate) === 0) {
      this.inputsDisabled = true;
    } else {
      this.inputsDisabled = false;
    }
  }

  shouldDisableInput(attributeIndex: number): boolean {
    return this.inputsDisabled && attributeIndex !== 0;
  }
}

