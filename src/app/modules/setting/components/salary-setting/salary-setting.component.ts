import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { PFContributionRate } from 'src/app/models/p-f-contribution-rate';
import { SalaryCalculationMode } from 'src/app/models/salary-calculation-mode';
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
  }


  //Code for toggle buttons in statutories section
  switchValueForPF = false;
  switchValueForESI = false;
  switchValueForProfessionalTax = false;



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

  selectedPFContributionRateForEmployees : PFContributionRate = new PFContributionRate();
  selectPFContributionRateForEmployees(pFContributionRate: PFContributionRate) {
    this.selectedPFContributionRateForEmployees = pFContributionRate;
  }

  selectedPFContributionRateForEmployers : PFContributionRate = new PFContributionRate();
  selectPFContributionRateForEmployers(pFContributionRate: PFContributionRate) {
    this.selectedPFContributionRateForEmployers = pFContributionRate;
  }

}

