import { Component, OnInit } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { EmployeeStateInsurance } from 'src/app/payroll-models/EmployeeStateInsurance';
import { EmployeeProvidentFund } from 'src/app/payroll-models/EmployeeProvidentFund';
import { PfContributionRate } from 'src/app/payroll-models/PfContributioRate';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollConfigurationService } from 'src/app/services/payroll-configuration.service';
import { ProfessionalTax, ProfessionalTaxSlab } from 'src/app/payroll-models/ProfeessionalTax';
import { AddressDetail } from 'src/app/payroll-models/AddressDetail';
import { TaxSlabService } from 'src/app/services/tax-slab.service';
import { LabourWelfareFund } from 'src/app/payroll-models/LabourWelfareFund';
import { ActivatedRoute } from '@angular/router';
import { PayrollTodoStep } from 'src/app/payroll-models/PayrollTodoStep';


@Component({
  selector: 'app-statutory',
  templateUrl: './statutory.component.html',
  styleUrls: ['./statutory.component.css']
})
export class StatutoryComponent implements OnInit {

  activeTab:any;
  taxDataList: ProfessionalTax[] = []; // Full tax data list
  selectedTaxSlabs: ProfessionalTaxSlab[] = []; // For selected state's slabs
  selectedStateName: string = ''; 


  constructor(private _payrollConfigurationService : PayrollConfigurationService, 
    private _helperService : HelperService,
  private taxSlabService: TaxSlabService,
    private activateRoute: ActivatedRoute
) {
   if (this.activateRoute.snapshot.queryParamMap.has('tab')) {
      this.activeTab = this.activateRoute.snapshot.queryParamMap.get('tab');
    }
  // this._route.queryParams.subscribe(params => {
  //   this.activeTab = params['tab'];
  //   console.log('Statutory Component - Active Tab:', this.activeTab);

  // });
}

  ngOnInit(): void {
    this.getEpfDetail();
    this.getPfContribution();
    this.getEsiDetail();
    this.getAddressDetail();
    this.getPtDetail();
    this.getLwfDetail();
    this.getTodoList();
   
  }



  loadingFlags: { [key: string]: boolean } = {}; 


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



      isLopChecked:boolean = true;
      toggleLOPVisibility(): void {
        console.log("toggled",this.isLopChecked)
      }
  
      calculateValue(type: string, value: number): string {
        if (this.isLopChecked) {
          if (type === 'basic') {
            return ` ${(value * 0.85).toFixed(2)}`; 
          }
          if (type === 'transport') {
            return ` ${(value * 0.90).toFixed(2)}`; 
          }
        }
        return ` ${value.toFixed(2)}`;
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

      //************************           Professional Tax       ******************************** */


      professionalTaxDetail:ProfessionalTax[] = new Array();
      getPtDetail(){
        this._payrollConfigurationService.getProfessionalTax().subscribe(
          (response) => {
            if(response.status){
              this.professionalTaxDetail= response.object;
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


      viewTaxSlab(state: string){

      }




      // ########################## Labour Welfare Fund #######################


      labourWelfareFundDetail:LabourWelfareFund[] = new Array();
      loadingStates: { [key: string]: boolean } = {}; 
      getLwfDetail(){
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
        const address = this.addressDetail.find(address => address.state === state)
        if(lwf && address){
          const newStatus = isChecked ? 11 : 12;
          this.loadingStates[state] = true;
          lwf.status = newStatus; 
          this._payrollConfigurationService.changeLwfStatus(address.id).subscribe(
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
      


      toDoStepList:PayrollTodoStep[]=new Array();
   getTodoList() {

      this._payrollConfigurationService.getTodoList().subscribe(
        (response) => {
          if(response.status){
            this.toDoStepList = response.object;
            this.checkAllCompleted();

          }
        },
        (error) => {
  
        }
      );
    }
    checkAllCompleted(): boolean {
      return this.toDoStepList.every(step => step.completed);
    }


    selectedProfessionalTax:ProfessionalTax = new ProfessionalTax();
    viewSelectedSlab(professionalTax:ProfessionalTax){
      this.selectedProfessionalTax = professionalTax;

    }
}
