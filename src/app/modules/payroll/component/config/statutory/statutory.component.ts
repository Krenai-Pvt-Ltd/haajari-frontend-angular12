import { Component, OnInit } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { EmployeeStateInsurance } from 'src/app/payroll-models/EmployeeStateInsurance';
import { EmployeeProvidentFund } from 'src/app/payroll-models/EmployeeProvidentFund';
import { PfContributionRate } from 'src/app/payroll-models/PfContributioRate';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollConfigurationService } from 'src/app/services/payroll-configuration.service';
import { ProfessionalTax } from 'src/app/payroll-models/ProfeessionalTax';
import { AddressDetail } from 'src/app/payroll-models/AddressDetail';
import { TaxSlabService } from 'src/app/services/tax-slab.service';


@Component({
  selector: 'app-statutory',
  templateUrl: './statutory.component.html',
  styleUrls: ['./statutory.component.css']
})
export class StatutoryComponent implements OnInit {


  constructor(private _payrollConfigurationService : PayrollConfigurationService, 
    private _helperService : HelperService,
  private taxSlabService: TaxSlabService) {}

  ngOnInit(): void {
    this.getEpfDetail();
    this.getPfContribution();
    this.getEsiDetail();
    this.getAddressDetail();
    this.getPtDetail();
  }

  epfDetail:EmployeeProvidentFund = new EmployeeProvidentFund();
  getEpfDetail(){
      this._payrollConfigurationService.getEpfDetail().subscribe(
        (response) => {
          if(response.status){
            this.epfDetail= response.object;
            if(this.epfDetail==null){
              this.epfDetail = new EmployeeProvidentFund();
            }
          }
        },
        (error) => {
  
        }
      );
    }


    pfContributionRate:PfContributionRate [] = new Array();
      getPfContribution(){
        this._payrollConfigurationService.getPfContribution().subscribe(
          (response) => {
            if(response.status){
              this.pfContributionRate = response.object;
                 
            }
            if(this.pfContributionRate == null){
              this.pfContributionRate = [];
            }
          },
          (error) => {
          }
        );
      }

      get filteredEmployerContributions(): PfContributionRate[] {
        return this.pfContributionRate.filter(pf => pf.contributorType === 1);
      }
      get filteredEmployeeContributions(): PfContributionRate[] {
        return this.pfContributionRate.filter(pf => pf.contributorType === 2);
      }
    

      selectedPfWage(id: number) {
        this.epfDetail.employerContribution = id;

          if (id === 1) {
            this.epfDetail.employeeContribution = 3;
        } 
      }
    
    saveLoader:boolean=false;
      saveEpfDetail(){
        this.saveLoader = true;
        this.epfDetail =  this.transformBooleansToNumbers(this.epfDetail);
        this._payrollConfigurationService.saveEpfDetail(this.epfDetail).subscribe(
          (response) => {
            if(response.status){
              this._helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
            }else{
              this._helperService.showToast(response.message, Key.TOAST_STATUS_ERROR);
            }
            this.saveLoader = false;
          },
          (error) => {
            this.saveLoader = false;
          }
        );
      }

//TODO : add this method to a common service -> cmplexity of this method is high  (6) try belo commentred code with complexity 1
      private transformBooleansToNumbers(obj: any): any {
        let transformedObj = { ...obj };
        Object.keys(transformedObj).forEach(key => {
          if (typeof transformedObj[key] === "boolean") {
            transformedObj[key] = transformedObj[key] ? 1 : 0;
          }
        });
        return transformedObj;
      }

    //   private transformBooleansToNumbers(obj: any): any {
    //     return Object.fromEntries(
    //         Object.entries(obj).map(([key, value]) => [key, value === true ? 1 : value === false ? 0 : value])
    //     );
    // }

      //************************           ESI        ******************************** */

      esiDetail:EmployeeStateInsurance = new EmployeeStateInsurance();
      getEsiDetail(){
        this._payrollConfigurationService.getEsiDetail().subscribe(
          (response) => {
            if(response.status){
              this.esiDetail= response.object;
              if(this.esiDetail==null){
                this.esiDetail = new EmployeeStateInsurance();
              }
            }
          },
          (error) => {
    
          }
        );
      }

      saveEsiDetail(){
        this.saveLoader = true;
        this.esiDetail =  this.transformBooleansToNumbers(this.esiDetail);
        this._payrollConfigurationService.saveEsiDetail(this.esiDetail.isCtcIncluded,this.esiDetail.esiNumber).subscribe(
          (response) => {
            if(response.status){
              this._helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
            }else{
              this._helperService.showToast(response.message, Key.TOAST_STATUS_ERROR);
            }
            this.saveLoader = false;
          },
          (error) => {
            this.saveLoader = false;
          }
        );
      }

      //************************           Professional Tax       ******************************** */


      ptDetail:ProfessionalTax[] = new Array();
      getPtDetail(){
        this._payrollConfigurationService.getProfessionalTax().subscribe(
          (response) => {
            if(response.status){
              this.ptDetail= response.object;
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
        return this.ptDetail.some(pt => pt.state === state);
      }

      sendTaxSlab(state: string) {
        const filteredTaxSlab = this.ptDetail.find(pt => pt.state === state);
        if (filteredTaxSlab) {
          this.taxSlabService.updateTaxSlab(filteredTaxSlab);
        } else {
        }
      }

      getPtNumberForState(state: string): string {
        const pt = this.ptDetail.find(pt => pt.state === state);
        return pt ? pt.professionalTaxNumber : '';
      }
    
      // Method to update the PT number for a specific state
      updatePtNumber(state: string, ptNumber: string): void {
        const pt = this.ptDetail.find(pt => pt.state === state);
        if (pt) {
          pt.professionalTaxNumber = ptNumber;
        }
      }

      // Track the edit state for each individual state
editingStates: { [key: string]: boolean } = {};

toggleEdit(state: string): void {
  // Toggle the specific state, defaulting to false if it's not defined yet
  this.editingStates[state] = !this.editingStates[state];
}


      savePtNumber(state:string){
        this.saveLoader = true;
        const pt = this.ptDetail.find(pt => pt.state === state);
        if(pt){
          this._payrollConfigurationService.savePtNumber(pt.professionalTaxNumber,Number(pt.id)).subscribe(
            (response) => {
              if(response.status){
                this._helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
              }else{
                this._helperService.showToast(response.message, Key.TOAST_STATUS_ERROR);
              }
              this.saveLoader = false;
            },
            (error) => {
              this.saveLoader = false;
            }
          );

        }
          
      }
      
    
    
      

}
