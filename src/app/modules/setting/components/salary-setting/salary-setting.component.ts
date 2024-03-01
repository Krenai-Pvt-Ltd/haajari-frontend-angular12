import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { ESIContributionRate } from 'src/app/models/e-si-contribution-rate';
import { PFContributionRate } from 'src/app/models/p-f-contribution-rate';
import { SalaryCalculationMode } from 'src/app/models/salary-calculation-mode';
import { Statutory } from 'src/app/models/statutory';
import { StatutoryAttribute } from 'src/app/models/statutory-attribute';
import { StatutoryAttributeResponse } from 'src/app/models/statutory-attribute-response';
import { StatutoryRequest } from 'src/app/models/statutory-request';
import { StatutoryResponse } from 'src/app/models/statutory-response';
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
    this.getESIContributionRateMethodCall();
    this.getAllStatutoriesMethodCall();
  }


  //Code for toggle buttons in statutories section
  switchValueForPF = false;
  switchValueForESI = false;
  switchValueForProfessionalTax = false;

  EPF_ID = Key.EPF_ID;
  ESI_ID = Key.ESI_ID;
  PROFESSIONAL_TAX_ID = Key.PROFESSIONAL_TAX_ID;

  UNRESTRICTED_PF_WAGE = Key.UNRESTRICTED_PF_WAGE;
  RESTRICTED_PF_WAGE_UPTO_15000 = Key.RESTRICTED_PF_WAGE_UPTO_15000;

  setStatutoryVariablesToFalse(){
    this.switchValueForPF = false;
    this.switchValueForESI = false;
    this.switchValueForProfessionalTax = false;
  }


  //Code for shimmers and placeholders
  isShimmerForSalaryCalculationMode = false;
  dataNotFoundPlaceholderForSalaryCalculationMode = false;
  networkConnectionErrorPlaceHolderForSalaryCalculationMode = false;
  preRuleForShimmersAndErrorPlaceholdersForSalaryCalculationModeMethodCall(){
    this.isShimmerForSalaryCalculationMode = true;
    this.dataNotFoundPlaceholderForSalaryCalculationMode = false;
    this.networkConnectionErrorPlaceHolderForSalaryCalculationMode = false;
  }

  isShimmerForStatutory = false;
  dataNotFoundPlaceholderForStatutory = false;
  networkConnectionErrorPlaceHolderForStatutory = false;
  preRuleForShimmersAndErrorPlaceholdersForStatutoryMethodCall(){
    this.isShimmerForStatutory = true;
    this.dataNotFoundPlaceholderForStatutory = false;
    this.networkConnectionErrorPlaceHolderForStatutory = false;
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


  eSIContributionRateList : ESIContributionRate[] = [];
  getESIContributionRateMethodCall(){
    this.dataService.getESIContributionRate().subscribe((response) => {
      this.eSIContributionRateList = response.listOfObject;
    }, (error) => {

    })
  }

  //Fetching the statutories from the database
  statutoryResponseList : StatutoryResponse[] = [];
  getAllStatutoriesMethodCall(){
    this.preRuleForShimmersAndErrorPlaceholdersForStatutoryMethodCall();
    this.dataService.getAllStatutories().subscribe((response) => {
      this.statutoryResponseList = response.listOfObject;
      this.setStatutoryVariablesToFalse();

      if(response === null || response === undefined || response.listOfObject === null || response.listOfObject === undefined || response.listOfObject.length === 0){
        this.dataNotFoundPlaceholderForStatutory = true;
      }
    }, (error) => {
      this.networkConnectionErrorPlaceHolderForStatutory = true;
    })
  }






  // clickSwitch(statutoryResponse : StatutoryResponse): void {
  // debugger
  //   if (!statutoryResponse.loading) {
  //     statutoryResponse.loading = true;
  //     setTimeout(() => {
  //       statutoryResponse.switchValue = !statutoryResponse.switchValue;
  //       statutoryResponse.loading = false;
  //     }, 3000);
  //   }

  //   if(statutoryResponse.switchValue === false){
  //     if(statutoryResponse.id == this.EPF_ID){
  //       this.switchValueForPF = true;
  //     } else if(statutoryResponse.id == this.ESI_ID){
  //       this.switchValueForESI = true;
  //     } else if(statutoryResponse.id == this.PROFESSIONAL_TAX_ID){
  //       this.switchValueForProfessionalTax = true;
  //     }
  //   }

  //   this.getStatutoryAttributeByStatutoryIdMethodCall(statutoryResponse.id);

  // }
  // turnOnTheToggle(statutoryResponse : StatutoryResponse, state: boolean){

  //   if(statutoryResponse.id == this.EPF_ID){
  //     this.switchValueForPF = true;
  //   } else if(statutoryResponse.id == this.ESI_ID){
  //     this.switchValueForESI = true;
  //   } else if(statutoryResponse.id == this.PROFESSIONAL_TAX_ID){
  //     this.switchValueForProfessionalTax = true;
  //   }

  //   this.getStatutoryAttributeByStatutoryIdMethodCall(statutoryResponse.id);
  //   this.statutoryRequest.id = statutoryResponse.id;
  //   this.statutoryRequest.name = statutoryResponse.name;
  //   this.statutoryRequest.switchValue = !statutoryResponse.switchValue;
  // }

  async clickSwitch(statutoryResponse : StatutoryResponse){
    if(!statutoryResponse.loading){
      statutoryResponse.loading = true;
    }

    await this.getStatutoryAttributeByStatutoryIdMethodCall(statutoryResponse.id);

    this.statutoryRequest.id = statutoryResponse.id;
    this.statutoryRequest.name = statutoryResponse.name;
    this.statutoryRequest.switchValue = !statutoryResponse.switchValue;
    this.statutoryRequest.statutoryAttributeRequestList = this.statutoryAttributeResponseList;

    console.log(this.statutoryAttributeResponseList);

    if(statutoryResponse.switchValue === false){
      if(statutoryResponse.id == this.EPF_ID){
        this.switchValueForPF = true;
      } else if(statutoryResponse.id == this.ESI_ID){
        this.switchValueForESI = true;
      } else if(statutoryResponse.id == this.PROFESSIONAL_TAX_ID){
        this.switchValueForProfessionalTax = true;
      }

    } else{
      this.enableOrDisableStatutoryMethodCall();
    }
  }


  statutoryRequest : StatutoryRequest = new StatutoryRequest();
  enableOrDisableStatutoryMethodCall(){

    this.dataService.enableOrDisableStatutory(this.statutoryRequest).subscribe((response) => {
      this.setStatutoryVariablesToFalse();
      this.helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
      this.getAllStatutoriesMethodCall();
    }, (error) => {
      this.helperService.showToast("Error in updating "+this.statutoryRequest.name, Key.TOAST_STATUS_ERROR);
      this.getAllStatutoriesMethodCall();
    })
  }


  selectedPFContributionRateForEmployees : PFContributionRate = {
    id: 1,
    name: '12% of PF Wage (Unrestricted)',
    description: ''
  };

  selectedPFContributionRateForEmployers: PFContributionRate = {
    id: 1,
    name: '12% of PF Wage (Unrestricted)',
    description: ''
  };

  //Fetching statutory's attributes
  statutoryAttributeResponseList : StatutoryAttributeResponse[] = [];
  getStatutoryAttributeByStatutoryIdMethodCall(statutoryId : number){
    debugger
    return new Promise((resolve, reject) => {
        this.dataService.getStatutoryAttributeByStatutoryId(statutoryId).subscribe((response) => {
          this.statutoryAttributeResponseList = response.listOfObject;
    
          if(statutoryId == this.EPF_ID){
            if (this.pFContributionRateList.length > 0) {
              const defaultPFContributionRate = this.pFContributionRateList[0];
              this.statutoryAttributeResponseList.forEach(attr => {
                if(attr.value === undefined || attr.value === null || attr.value === ""){
                  attr.value = defaultPFContributionRate.name;
                }
              });
            }
          } else if(statutoryId == this.ESI_ID){
            this.statutoryAttributeResponseList.forEach(attr => {
            const matchingESIRate = this.eSIContributionRateList.find((iterator) => iterator.statutoryAttribute.id === attr.id);
            console.log(this.eSIContributionRateList);
            if (matchingESIRate) {
              if(attr.value === undefined || attr.value === null || attr.value === ""){
                  attr.value = matchingESIRate.name;
                }
              }
            });   
          }
          resolve(response);
        }, (error) => {
          reject(error);
      })
    })
  }

  //Disable other inputs if Employer's PF Contribution input is selected as Unirestricted
  inputsDisabled: boolean = true;
  selectPFContributionRate(statutoryAttribute: StatutoryAttribute, pFContributionRate: PFContributionRate, index : number) {
    
    statutoryAttribute.value = pFContributionRate.name;

    console.log(this.statutoryAttributeResponseList);

    if (index === 0 && this.pFContributionRateList.indexOf(pFContributionRate) === 0) {
      this.inputsDisabled = true;
    } else {
      this.inputsDisabled = false;
    }

    this.statutoryRequest.statutoryAttributeRequestList = this.statutoryAttributeResponseList;
  }

  shouldDisableInput(attributeIndex: number): boolean {
    return this.inputsDisabled && attributeIndex !== 0;
  }
}

