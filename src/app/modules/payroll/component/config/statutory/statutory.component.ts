import { Component, OnInit, ViewChild } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { EmployeeStateInsurance } from 'src/app/payroll-models/EmployeeStateInsurance';
import { EmployeeProvidentFund } from 'src/app/payroll-models/EmployeeProvidentFund';
import { PfContributionRate } from 'src/app/payroll-models/PfContributioRate';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollConfigurationService } from 'src/app/services/payroll-configuration.service';
import { ProfessionalTax } from 'src/app/payroll-models/ProfeessionalTax';
import { AddressDetail } from 'src/app/payroll-models/AddressDetail';
import { LabourWelfareFund } from 'src/app/payroll-models/LabourWelfareFund';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { constant } from 'src/app/constant/constant';
@Component({
  selector: 'app-statutory',
  templateUrl: './statutory.component.html',
  styleUrls: ['./statutory.component.css']
})
export class StatutoryComponent implements OnInit {

  readonly constant = constant;

  constructor(private _payrollConfigurationService : PayrollConfigurationService, 
    private _helperService : HelperService,
    private _router : Router) {
    
  }
  ngOnInit(): void {
    window.scroll(0,0);
    this.getPfContribution();
    this.getOrganizationEPF();
    this.getOrganizationESI();
    this.getProfessionalTax();
    this.getLabourWelfareFund();
  }


  pfContributionRate:PfContributionRate [] = new Array();
  getPfContribution(){
    this._payrollConfigurationService.getPfContribution().subscribe(
      (response) => {
        if(response.status){
          this.pfContributionRate = response.object;
          if(this.pfContributionRate == null){
            this.pfContributionRate = [];
          }
        }
      },(error) => {
      }
    );
  }

  get filteredEmployerContributions(): PfContributionRate[] {
    return this.pfContributionRate.filter(pf => pf.contributorType === 1);
  }
  
  get filteredEmployeeContributions(): PfContributionRate[] {
    return this.pfContributionRate.filter(pf => pf.contributorType === 2);
  }


  loadingFlags: { [key: string]: boolean } = {}; 
  epfDetail:EmployeeProvidentFund = new EmployeeProvidentFund();
  getOrganizationEPF(){
      this._payrollConfigurationService.getEpfDetail().subscribe((response) => {
          if(response.status){
            this.epfDetail= response.object;
            
            if(this.epfDetail==null){
              this.epfDetail = new EmployeeProvidentFund();
            }          
            this.epfNumberForView = this.formatEpfNumberForView(this.epfDetail.epfNumber);
          }else{
            this.epfDetail = new EmployeeProvidentFund();
          }
          this.transformEpfNumber(this.epfDetail);
          this.calculatePFContribution();
        },
        (error) => {
  
        }
      );
    }

    @ViewChild('epfForm') epfForm!:NgForm;
    @ViewChild('esiForm') esiForm!:NgForm;
    formReset(){
      window.scroll(0,0);
      this.epfForm.form.markAsPristine();
      this.epfForm.form.markAsUntouched();
      this.esiForm.form.markAsPristine();
      this.esiForm.form.markAsUntouched();
    }
    
    saveLoader:boolean=false;
      saveEpfDetail(){
        this.saveLoader = true;
        this.epfDetail =  this.transformBooleansToNumbers(this.epfDetail);
        this._payrollConfigurationService.saveEpfDetail(this.epfDetail).subscribe(
          (response) => {
            if(response.status){
              this.formReset();
              this._helperService.showToast("EPF Details saved successfully", Key.TOAST_STATUS_SUCCESS);
            }else{
              this._helperService.showToast("An error has been occcured while saving.", Key.TOAST_STATUS_ERROR);
            }
            this.saveLoader = false;  
          },
          (error) => {
            this.saveLoader = false;
            this._helperService.showToast("An error has been occcured while saving.", Key.TOAST_STATUS_ERROR);
          }
        );
      }



      isLopChecked:boolean = false;
      calculateValue( value: number): number {
        if (this.isLopChecked) {
          return value/2;
        }
        return value;
      }

      calculatePFContribution(){
        if(this.epfDetail.employerContribution == 1){
          this.epfDetail.employeeContribution = 3;
        }
        this.onEmployeeContributionChange(this.epfDetail.employeeContribution);
        this.onEmployerContributionChange(this.epfDetail.employerContribution);
      }

      actualValue:number=20000;
      restrictedValue:number=15000;
      calculatedpfWageValue:number=0;
      employeepfWageValue:number=0;
      employerpfWageValue:number=0;
      calculatedemployrepfWageValue:number=0;
      calculatedemployrepsWageValue:number=0;
      totalValue:number=0;
      onEmployeeContributionChange(id: number): void {
        if (id == 3) {
          this.employeepfWageValue = this.actualValue;
        } else if (id == 4) {
          this.employeepfWageValue = this.restrictedValue;
        } 
        this.calculatedpfWageValue = (this.employeepfWageValue * 12) / 100;
      }

   
      onEmployerContributionChange(id: number): void {
        if (id == 1) {
          this.employerpfWageValue = this.actualValue;
        } else if (id == 2) {
          this.employerpfWageValue = this.restrictedValue;
        } 
        this.calculatedemployrepsWageValue = Math.round((this.restrictedValue * 8.33) / 100);
        this.calculatedemployrepfWageValue = ((this.employerpfWageValue * 12)/ 100) - this.calculatedemployrepsWageValue;
        this.totalValue = this.calculatedemployrepsWageValue + this.calculatedemployrepfWageValue;

      }

      employerContributorDetail(): string {
        const employerpf = this.pfContributionRate.find(pf => pf.id === this.epfDetail.employerContribution);
        return employerpf ? employerpf.description : ''; 
      }
      

      employeeContributorDetail(): string {
        const employeepf = this.pfContributionRate.find(pf => pf.id === this.epfDetail.employeeContribution);
        return employeepf ? employeepf.description : '';
      }

      totalEpfValue:number=0;
      halfbasic:number=0;
      calculateEpfValue( basic: number,transport: number,telephone: number): number{
        if(this.isLopChecked){
          this.halfbasic = basic/2;
          if(this.epfDetail.condiserLop){
            if(this.halfbasic<15000){
              this.totalEpfValue = (basic + transport + telephone)/2;
              return (this.epfDetail.employerContribution == 2 && this.totalEpfValue>15000) ? this.totalEpfValue=15000 : this.totalEpfValue;
            }
            return (this.epfDetail.employerContribution == 2 && this.totalEpfValue>15000) ? this.totalEpfValue=15000 : this.totalEpfValue = this.halfbasic;
          }else{
            if(this.halfbasic<15000){
            this.totalEpfValue = (basic + transport + telephone)/2;
            return (this.epfDetail.employerContribution == 2 && this.totalEpfValue>15000) ? this.totalEpfValue=15000 : this.totalEpfValue;

            }
            return (this.epfDetail.employerContribution == 2 && this.totalEpfValue>15000) ? this.totalEpfValue=15000: this.totalEpfValue= this.halfbasic;
          }
        }else{
          if(this.epfDetail.condiserLop){
            if(basic<15000){
              return this.totalEpfValue = (basic + transport + telephone);
            }
            return (this.epfDetail.employerContribution === 2 && this.totalEpfValue>15000) ? this.totalEpfValue=15000 : this.totalEpfValue=basic;
          }else{
            if(basic<15000){
              return this.totalEpfValue = (basic + transport + telephone);
            }
            return (this.epfDetail.employerContribution === 2 && this.totalEpfValue>15000) ? this.totalEpfValue=15000 : this.totalEpfValue=basic;
          }

        }
      }




      


//TODO : add this method to a common service -> cmplexity of this method is high  (6) try belo commentred code with complexity 1
      private transformBooleansToNumbers(obj: any): any {
        let transformedObj = { ...obj };
        Object.keys(transformedObj).forEach(key => {
          if (typeof transformedObj[key] === "boolean") {
            transformedObj[key] = transformedObj[key] ? 1 : 0;
          }
          if (key === 'epfNumber' && typeof transformedObj[key] === 'string') {
            transformedObj[key] = transformedObj[key].replace(/\//g, ''); 
          }
        });
        return transformedObj;
      }

      private transformEpfNumber(obj: any): void {
        if (obj && obj.epfNumber && typeof obj.epfNumber === 'string') {
          const rawValue = obj.epfNumber.replace(/\//g, '');
          if (rawValue.length === 15 || rawValue.length === 17) {
            obj.epfNumber = `${rawValue.substring(0, 2)}/${rawValue.substring(2, 5)}/${rawValue.substring(5, 12)}/${rawValue.substring(12, 15)}`;
          }
        }
      }

      epfNumberForView:string='';
      formatEpfNumber(event: any): void {
        let value = event.target.value.toUpperCase().replace(/\//g, '');
      
        value = value.replace(/[^A-Z0-9]/g, '');
      
        const part1 = value.substring(0, 2);
        const part2 = value.substring(2, 5);
        const part3 = value.substring(5, 12);
        const part4 = value.substring(12, 15);
      
        let formatted = part1;
        if (part2) formatted += '/' + part2;
        if (part3) formatted += '/' + part3;
        if (part4) formatted += '/' + part4;
      
        this.epfNumberForView = formatted;
        this.epfDetail.epfNumber = value;
      }

      formatEpfNumberForView(rawValue: string): string{
        const value = rawValue.replace(/[^A-Z0-9]/g, '');
        const part1 = value.substring(0, 2);
        const part2 = value.substring(2, 5);
        const part3 = value.substring(5, 12);
        const part4 = value.substring(12, 15);
      
      
        let formatted = part1;
        if (part2) formatted += '/' + part2;
        if (part3) formatted += '/' + part3;
        if (part4) formatted += '/' + part4;


        return formatted;
      }
      
      


      //************************           ESI        ******************************** */

      esiDetail:EmployeeStateInsurance = new EmployeeStateInsurance();
      getOrganizationESI(){
        this._payrollConfigurationService.getEsiDetail().subscribe(
          (response) => {
            if(response.status){
              this.esiDetail= response.object;
              if(this.esiDetail==null){
                this.esiDetail = new EmployeeStateInsurance();
              }
              this.esiNumberForView = this.formatEsiNumberForView(this.esiDetail.esiNumber);
            }
            this.transformEsiNumber(this.esiDetail);
          },
          (error) => {
    
          }
        );
      }

      saveEsiDetail(){
        this.saveLoader = true;
        this.esiDetail =  this.transformBooleansToNumbers(this.esiDetail);
        this.removeEsiNumberDashes(this.esiDetail);
        this._payrollConfigurationService.saveEsiDetail(this.esiDetail.isCtcIncluded,this.esiDetail.esiNumber).subscribe(
          (response) => {
            if(response.status){
              this.formReset();
              this._helperService.showToast("ESI Details saved successfully", Key.TOAST_STATUS_SUCCESS);
            }else{
              this._helperService.showToast("An error has been occcured while saving.", Key.TOAST_STATUS_ERROR);
            }
            this.saveLoader = false;
          },
          (error) => {
            this.saveLoader = false;
            this._helperService.showToast("An error has been occcured while saving.", Key.TOAST_STATUS_ERROR);
          }
        );
      }


      private transformEsiNumber(obj: any): void {
        if (obj && obj.esiNumber && typeof obj.esiNumber === 'string') {
          const rawValue = obj.esiNumber.replace(/-/g, '');
          if (rawValue.length === 17) {
            obj.esiNumber = `${rawValue.substring(0, 2)}-${rawValue.substring(2, 4)}-${rawValue.substring(4, 10)}-${rawValue.substring(10, 13)}-${rawValue.substring(13, 17)}`;
          }
        }
      }

      private removeEsiNumberDashes(obj: any): void {
        if (obj && obj.esiNumber && typeof obj.esiNumber === 'string') {
          obj.esiNumber = obj.esiNumber.replace(/-/g, ''); 
        }
      }

      esiNumberForView:string='';
      formatEsiNumber(event: any): void {
        let value = event.target.value.replace(/-/g, '');

        value = value.replace(/\D/g, '');
  
        const part1 = value.substring(0, 2);
        const part2 = value.substring(2, 4);
        const part3 = value.substring(4, 10);
        const part4 = value.substring(10, 13);
        const part5 = value.substring(13, 17);
      
        let formatted = part1;
        if (part2) formatted += '-' + part2;
        if (part3) formatted += '-' + part3;
        if (part4) formatted += '-' + part4;
        if (part5) formatted += '-' + part5;
      
        this.esiNumberForView = formatted;
        this.esiDetail.esiNumber = value;

      }
      formatEsiNumberForView(rawValue: string): string {
        const value = rawValue.replace(/\D/g, '');
        const part1 = value.substring(0, 2);
        const part2 = value.substring(2, 4);
        const part3 = value.substring(4, 10);
        const part4 = value.substring(10, 13);
        const part5 = value.substring(13, 17);
      
        let formatted = part1;
        if (part2) formatted += '-' + part2;
        if (part3) formatted += '-' + part3;
        if (part4) formatted += '-' + part4;
        if (part5) formatted += '-' + part5;
      
        return formatted;
      }
      
      
      
      

      //************************           Professional Tax       ******************************** */


      professionalTaxDetail:ProfessionalTax[] = new Array();
      getProfessionalTax(){
        this._payrollConfigurationService.getProfessionalTax().subscribe(
          (response) => {
            if(response.status){
              this.professionalTaxDetail= response.object;
              if(this.professionalTaxDetail==null ){
                this.professionalTaxDetail= [];
              }
            }
          },
          (error) => {
    
          }
        );
      }

      addressDetail:AddressDetail[] = new Array();
      getAddressDetail(){
        this._payrollConfigurationService.getAddressList().subscribe(
          (response) => {
            if(response.status){
              this.addressDetail= response.object;
             
            }
          },
          (error) => {
    
          }
        );
      }

      isTaxApplicable(state: string): boolean {
        return this.professionalTaxDetail.some(pt => pt.state === state);
      }

      getPtNumberForState(state: string): string {
        const pt = this.professionalTaxDetail.find(pt => pt.state === state);
        return pt ? pt.professionalTaxNumber : '';
      }
    
      updatePtNumber(state: string, ptNumber: string): void {
        const pt = this.professionalTaxDetail.find(pt => pt.state === state);
        if (pt) {
          pt.professionalTaxNumber = ptNumber;
        }
      }

      editingStates: { [key: string]: boolean } = {};

      toggleEdit(state: string): void {
        this.editingStates[state] = !this.editingStates[state];
      }


      savePtNumber(state:string){
        this.saveLoader = true;
        const pt = this.professionalTaxDetail.find(pt => pt.state === state);
        if(pt){
          this._payrollConfigurationService.savePtNumber(pt.professionalTaxNumber,Number(pt.id)).subscribe(
            (response) => {
              if(response.status){
                this._helperService.showToast("Professional tax details updated successfully", Key.TOAST_STATUS_SUCCESS);
              }else{
                this._helperService.showToast("An error has been occcured while saving.", Key.TOAST_STATUS_ERROR);
              }
              this.editingStates[state] = false;
              this.saveLoader = false;
            },
            (error) => {
              this.editingStates[state] = false;
              this.saveLoader = false;
              this._helperService.showToast("An error has been occcured while saving.", Key.TOAST_STATUS_ERROR);

            }
          );

        }
          
      }




      // ########################## Labour Welfare Fund #######################


      labourWelfareFundDetail:LabourWelfareFund[] = new Array();
      loadingStates: { [key: string]: boolean } = {}; 
      getLabourWelfareFund(){
        this._payrollConfigurationService.getLabourWelfareFund().subscribe(
          (response) => {
            if(response.status){
              this.labourWelfareFundDetail= response.object;
              console.log(response);
            }
          },
          (error) => {
    
          }
        );
      }
      isFundApplicale(state: string): boolean {
        return this.labourWelfareFundDetail.some(pt => pt.state === state);
      }

    

      changeLwfStatus(isChecked:boolean,state:string){
        const lwf = this.labourWelfareFundDetail.find(pt => pt.state === state);
        if(lwf){
          const newStatus = isChecked ? 11 : 12;
          this.loadingStates[state] = true;
          lwf.status = newStatus; 
          this._payrollConfigurationService.changeLwfStatus(lwf.id).subscribe(
            (response) => {
              this._helperService.showToast("LWF status changed", Key.TOAST_STATUS_SUCCESS);
              this.loadingStates[state] = false;
            },
            (error) => {
              this.loadingStates[state] = false;
              this._helperService.showToast("Error in updating Status", Key.TOAST_STATUS_ERROR);
            }
          );
        }
          
      }
      checkStatus(state:string): boolean {
        const lwf = this.labourWelfareFundDetail.find(pt => pt.state === state);
        return lwf ? lwf.status === 11 : false; 
      }
    
      openDropdownIndex: number | null = null;

      toggleDropdown(index: number) {
        this.openDropdownIndex = this.openDropdownIndex === index ? null : index;
      }
    
      isDropdownOpen(index: number): boolean {
        return this.openDropdownIndex === index;
      }
      

    selectedProfessionalTax:ProfessionalTax = new ProfessionalTax();
    viewSelectedSlab(professionalTax:ProfessionalTax){
      this.selectedProfessionalTax = professionalTax;
    }

    routeToProfile() {
      this._router.navigate(['/payroll/configuration'], {queryParams: { tab: 'profile'},});
    }
}
