import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EarningComponent } from 'src/app/payroll-models/EarrningComponent';
import { StatusKeys } from 'src/app/constant/StatusKeys';
import { HelperService } from 'src/app/services/helper.service';
import { SalaryComponentService } from 'src/app/services/salary-component.service';
import { ComponentConfiguration } from 'src/app/payroll-models/ComponentConfiguration';
import { ReimbursementComponent } from 'src/app/payroll-models/ReimbursementComponent';
import { BenefitComponent } from 'src/app/payroll-models/BenefitComponent';
import { DeductionComponent } from 'src/app/payroll-models/DeductionComponent';
import { Key } from 'src/app/constant/key';
import { BenefitPlanType } from 'src/app/payroll-models/BenefitPlanType';
import { TaxExemptionSection } from 'src/app/payroll-models/TaxExemptionSection';
import { ReimbursementType } from 'src/app/payroll-models/ReimbursementType';


@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.css']
})
export class SalaryComponent implements OnInit {

  VALUE_TYPE_PERCENTAGE=1;
  VALUE_TYPE_FLAT=2;
  CALCULATION_BASED_CTC=3;
  CALCULATION_BASED_BASIC=4;
  PAY_TYPE_FIXED=5;
  PAY_TYPE_VARIABLE=6;
  CONSIDER_EPF=5;
  CONSIDER_ESI=6;

  readonly EARNING_COMPONENT =1;
  readonly BENEFIT_COMPONENT =2;
  readonly DEDUCTION_COMPONENT =3;
  readonly REIMBURSEMENT_COMPONENT =4;

  FREQUENCY_ONE_TIME=8;
  FREQUENCY_RECURRING =7;

  VPF =1;
  NPS =2;
  NON_TAXABLE=3

  currentPage = 1;
  itemPerPage = 10;
  totalItems = 0;

  shimmer: boolean = false;
  toggle:boolean =false;
  saveLoader:boolean=false;
  isNewComponent:boolean=false;

  constructor(private _salaryComponentService : SalaryComponentService,
    public _helperService : HelperService) { 
 
  }

  ngOnInit(): void {
    window.scroll(0,0);
    this.getOrganizationEarningComponent();
    
  }


    addComponent(component: number) {
      this.toggle = true;
      this.isNewComponent = true;
      this.selectedTab = component;

      switch (component) {
        //earning
        case 1: {
          this.getDefaultEarningComponent();
          break;
        }
        //benefit
        case 2: {
           this.getDefaultBenefitComponent();
          break;
        }
        //deduction
        case 3: {
           this.getDefaultDeductionComponent();
          break;
        }
        //reimbursement
        case 4: {
          this.getDefaultReimbursementComponent();
          break;
        }
      }
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                                         // 
//                                                                       EARNING COMPONENT                                                                                 // 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  earningComponents:EarningComponent[] = new Array();
  showSubComponent:boolean =false;
  defaultEarningComponents:EarningComponent[] = new Array();
  isLoading:boolean=false;
  getDefaultEarningComponent(){
    this.isLoading=true;
      this._salaryComponentService.getDefaultEarningComponent().subscribe((response) => {
          if(response.status){
            this.defaultEarningComponents= response.object;
            this.isLoading=false;
          }
          this.isLoading=false;

        },
        (error) => {
        }
      );
    }


  getOrganizationEarningComponent(){
      this.shimmer = true;
      this.earningComponents = [];
        this._salaryComponentService.getOrganizationEarningComponent().subscribe((response) => {
            if(response.status){
              this.earningComponents= response.object;
              this.totalItems = response.totalItems;

              if(this.earningComponents==null){
                this.earningComponents= new Array();
                this.totalItems = 0;
              }
            }else{
              this.earningComponents= new Array();
              this.totalItems = 0;
            }
            this.shimmer = false;
          },
          (error) => {
            this.shimmer = false;
            this.earningComponents= new Array();
            this.totalItems = 0;
          }
        );
      }

      getEarningStatus(configurations: ComponentConfiguration[], configId: number): string {
        return configurations.some(config => config.configurationId === configId && config.checked === true) 
            ? 'Yes' 
            : 'No';
    }
    
    
    getEarningClass(configurations: ComponentConfiguration[], configId: number): string {
      return configurations.some(config => config.configurationId === configId && config.checked === true) 
          ? 'text-success' 
          : 'text-danger';
  }
  
    

    checkStatus(statusId: number): boolean {
      return statusId == StatusKeys.ACTIVE ? true : false;
    }
    

    pageChange(page: number){
      if(this.currentPage!= page){
        this.currentPage = page;
        this.getOrganizationEarningComponent();
      }
    }

    viewSection(tab:number): boolean{
      if(tab == this.selectedTab){
        return true;
      }else{
        return false;
      }
    }

    selectedEarningComponent!:EarningComponent;
    selectedTab:number=1;
    editEarning(earningComponent : EarningComponent){
      this.toggle=true;
      this.selectedNewEarning = false;
      this.isNewComponent = false;
      this.selectedTab = this.EARNING_COMPONENT;
      this.selectedEarningComponent= JSON.parse(JSON.stringify(earningComponent)) ;
    }


    selectedPfWage = "12% of Actual PF Wage"; // Default selected value

    employer = [
      { label: "12% of Actual PF Wage", value: "12% of Actual PF Wage" },
      { label: "10% of Actual PF Wage", value: "10% of Actual PF Wage" }
    ];
    employee = [
      { label: "12% of Actual PF Wage", value: "12% of Actual PF Wage" },
      { label: "10% of Actual PF Wage", value: "10% of Actual PF Wage" }
    ];


    



  selectedNewEarning:boolean=false;
  selectedEarningType:string='';
   selectDefaultEarningComponent(type:string){
    this.selectedNewEarning = true;
    const selectedComponent = this.defaultEarningComponents.find(x=> x.name == type)
    this.selectedEarningComponent = JSON.parse(JSON.stringify(selectedComponent));
   } 

   backFromEarning(){
    this.toggle = false;
    this.selectedEarningType = '';
    this.selectedNewEarning = false;
    this.isNewComponent = false;
   }

 
   saveEarningComponent(){
      this.saveLoader = true;
      this._salaryComponentService.saveEarningComponent(this.selectedEarningComponent).subscribe((response) => {
          if(response.status){
            this.getOrganizationEarningComponent();
            this._helperService.showToast('Earning component saved successfully.',Key.TOAST_STATUS_SUCCESS);  

          }else{
            this._helperService.showToast('Error saving Earning component.',Key.TOAST_STATUS_ERROR);

          }
          this.backFromEarning();
          this.saveLoader = false;
        },
        (error) => {
          this.saveLoader = false;
        }
      );

   }

   @ViewChild("statusChange")statusChange!:ElementRef;
   @ViewChild("statusChangeCloseButton")statusChangeCloseButton!:ElementRef;
   componentId: number = 0;
   type:string='';
   loading:boolean=false;
   changeStatus(componentId:number,type:string){
    this.componentId = componentId;
    this.type=type;
    this.loadingMap[componentId] = true;
    this.statusChange.nativeElement.click();
   }

   loadingMap: { [key: number]: boolean } = {};
   load(componentId:number){
    return !!this.loadingMap[componentId];
   }

   statusToggle:boolean=false;
   chnageComponentStatus() {
    this.statusToggle = true;
    this._salaryComponentService.changeComponentStatus(this.componentId, this.type).subscribe(
      (response) => {
        if (response.status) {
          this._helperService.showToast('Status updated successfully.', Key.TOAST_STATUS_SUCCESS);
          this.toggleStatus(this.type);
        } else {
          this._helperService.showToast('Error updating component.', Key.TOAST_STATUS_ERROR);
        }
        this.statusToggle = false;
        this.statusChangeCloseButton.nativeElement.click();
        this.loadingMap[this.componentId] = false;
      },
      (error) => {
        this.statusToggle = false;
      }
    );
  }
  
  toggleStatus(type: string) {
    const componentListMap: { [key: string]: any[] } = {
      earning: this.earningComponents,
      deduction: this.deductionComponents,
      benefit: this.benefitComponents,
      reimbursement: this.reimbursementComponents,
    };
  
    const component = componentListMap[type]?.find((comp: any) => comp.id === this.componentId);
    if (component) {
      component.statusId = component.statusId === 11 ? 12 : 11;
    }
  }

  closeModal(){
    this.loadingMap[this.componentId] = false;
  }

  @ViewChild("deleteComponentButton") deleteComponentButton!:ElementRef;
  @ViewChild("deleteComponentCloseButton") deleteComponentCloseButton!:ElementRef;
  openDeleteModal(componentId:number,type:string){
    this.componentId=componentId;
    this.type=type;
    this.deleteComponentButton.nativeElement.click();
  }


  deleteEarningComponent(){
    this.saveLoader=true;
    this._salaryComponentService.deleteEarningComponent(this.componentId).subscribe((response) => {
      if(response.status){
        this._helperService.showToast('Component deleted successfully.',Key.TOAST_STATUS_SUCCESS);  

      }else{
        this._helperService.showToast('Error Deleting component.',Key.TOAST_STATUS_ERROR);

      }
      this.saveLoader=false;
      this.deleteComponentCloseButton.nativeElement.click();
      this.getOrganizationEarningComponent();
      this.saveLoader = false;
    },
    (error) => {
      this._helperService.showToast('Error Deleting component.',Key.TOAST_STATUS_ERROR);
      this.saveLoader = false;
      this.deleteComponentCloseButton.nativeElement.click();

    }
  );
  }


  confirmDeleteComponent(){
    this.saveLoader = true;
    switch (this.type) {
      case 'earning':
        this.deleteEarningComponent();
        break;
      case 'benefit':
        this.deleteBenefitComponent();
        break;
      case 'deduction':
        this.deleteDeductionComponent();
        break;
      case 'reimbursement':
        this.deleteReimbursementComponent();
        break;
      
    }
  }
  
  

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                                         // 
//                                                                       BENEFIT COMPONENT                                                                           // 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
getDefaultBenefitComponent() {
  this.selecteBenefitComponent = new BenefitComponent(); 

  this.selecteBenefitComponent.benefitTypeId = this.NPS; 
  
  this.selecteBenefitComponent.configurations = this.configurationsForNPS.map(config => ({
    ...config,
    editable: true,
    checked: false,
  }));
  this.getBenefitPlanType();
  this.getTaxExemptionSection();
  this.selectedNewBenefit = true;
  this.selecteBenefitComponent.displayName = "National Pension Scheme";

}

benefitComponents:BenefitComponent[] = new Array();
selectedNewBenefit:boolean=false;
selecteBenefitComponent!:BenefitComponent;
getOrganizationBenefitComponent(){
  this.shimmer = true;
  this.benefitComponents = [];
    this._salaryComponentService.getOrganizationBenefitComponent().subscribe((response) => {
        if(response.status){
          this.benefitComponents= response.object;
          this.totalItems = response.object.totalElements;

          if(this.benefitComponents==null){
            this.benefitComponents= new Array();
            this.totalItems = 0;
          }
        }else{
          this.benefitComponents= new Array();
          this.totalItems = 0;
        }
        this.shimmer = false;
      },
      (error) => {
        this.shimmer = false;
        this.benefitComponents= new Array();
        this.totalItems = 0;
      }
    );
  }

  benefitPlanType:BenefitPlanType[]= new Array();
  getBenefitPlanType(){
    this._salaryComponentService.getBenefitPlanType().subscribe(
      (response) => {
        if (response.status && response.object) {
          this.benefitPlanType = response.object;
        } else {
          this.benefitPlanType = [];
        }

        if (this.isNewComponent && this.selecteBenefitComponent.benefitTypeId !== 1) {
          this.benefitPlanType = this.benefitPlanType.slice(-2);
        }
      },
      (error) => {
        this.benefitPlanType = [];
      }
    );
  }
  

  taxExemptionSection:TaxExemptionSection[]= new Array();
  getTaxExemptionSection(){
    this._salaryComponentService.getTaxExemptionSection().subscribe(
      (response) => {
        if (response.status) {
          this.taxExemptionSection = response.object;
          if (this.taxExemptionSection == null) {
            this.taxExemptionSection = new Array();
          }
        }
      },
      (error) => {}
    );
  }

  editBenefit(benefitComponent : BenefitComponent){
    this.getBenefitPlanType();
    this.getTaxExemptionSection();
    this.toggle=true;
    this.selectedNewBenefit = false;
    this.isNewComponent = false;
    this.selectedTab = this.BENEFIT_COMPONENT;
    this.selecteBenefitComponent= JSON.parse(JSON.stringify(benefitComponent));
  }

  backFromBenefit(){
    this.toggle = false;
    this.selectedNewBenefit = false;
     this.isNewComponent = false;
     this.selecteBenefitComponent=new BenefitComponent;
  }


  onBenefitPlanChange(selectedValue: number): void {
    if (!this.selecteBenefitComponent) return;
  
    this.selecteBenefitComponent.configurations = [];
  
    if (selectedValue === this.NPS) {  
      this.selecteBenefitComponent.configurations = this.configurationsForNPS.map(config => ({
        ...config,
        editable: true,
        checked: false,
      }));
    } else if (selectedValue === this.NON_TAXABLE) { 
      this.selecteBenefitComponent.configurations = this.configurationsForNonTabxle.map(config => ({
        ...config,
        editable: true,
        checked: false,
      }));
    }
    const selectedType = this.benefitPlanType.find(type => type.id == selectedValue);
    if (selectedType) {
        this.selecteBenefitComponent.displayName = selectedType.description;
    }

  
  }
  

  configurationsForNonTabxle: any[] = [
    {
      name: "Calculate on pro-rata basis",
      description: "Pay will be adjusted based on employee working days.",
      configurationId: 3
    },
    {
      name: "Consider this a superannuation fund",
      description: null,
      configurationId: 10,
    },
    {
      name: "Include employer's contribution in employee’s salary structure.",
      description: null,
      configurationId: 11,
    }
  ];
  configurationsForNPS: any[] = [
    {
      name: "Calculate on pro-rata basis",
      description: "Pay will be adjusted based on employee working days.",
      configurationId: 3,
    },
    {
      name: "Include employer's contribution in employee’s salary structure.",
      description: null,
      configurationId: 11,

    }
  ];
  

  saveBenefitComponent(){
    this.saveLoader = true;
    this.selecteBenefitComponent.displayName 
    this._salaryComponentService.saveBenefitComponent(this.selecteBenefitComponent).subscribe((response) => {
        if(response.status){
          this.getOrganizationBenefitComponent();
          this._helperService.showToast('Benefit component saved successfully.',Key.TOAST_STATUS_SUCCESS);  
        }else{
          this._helperService.showToast('Error saving benefit component.',Key.TOAST_STATUS_ERROR);
        }
        this.backFromBenefit();
        this.saveLoader = false;
      },
      (error) => {
        this.saveLoader = false;
      }
    );

 }



 deleteBenefitComponent(){
   this.saveLoader=true;
   this._salaryComponentService.deleteBenefitComponent(this.componentId).subscribe((response) => {
     if(response.status){
       this._helperService.showToast('Component deleted successfully.',Key.TOAST_STATUS_SUCCESS);  

     }else{
       this._helperService.showToast('Error Deleting component.',Key.TOAST_STATUS_ERROR);

     }
     this.saveLoader=false;
     this.deleteComponentCloseButton.nativeElement.click();
     this.getOrganizationBenefitComponent();
     this.saveLoader = false;
   },
   (error) => {
     this._helperService.showToast('Error Deleting component.',Key.TOAST_STATUS_ERROR);
     this.saveLoader = false;
     this.deleteComponentCloseButton.nativeElement.click();

   }
 );
 }
  




























/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                                         // 
//                                                                       DEDUCTION COMPONENT                                                                           // 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
getDefaultDeductionComponent(){
  this.selecteDeductionComponent = new DeductionComponent();
   
  }

deductionComponents:DeductionComponent[] = new Array();
selectedNewDeduction:boolean=false;
selecteDeductionComponent!:DeductionComponent;
getOrganizationDeductionComponent(){
  this.shimmer = true;
  this.deductionComponents = [];
    this._salaryComponentService.getOrganizationDeductionComponent().subscribe((response) => {
        if(response.status){
          this.deductionComponents= response.object;
          this.totalItems = response.object.totalElements;

          if(this.deductionComponents==null){
            this.deductionComponents= new Array();
            this.totalItems = 0;
          }
        }else{
          this.deductionComponents= new Array();
          this.totalItems = 0;
        }
        this.shimmer = false;
      },
      (error) => {
        this.shimmer = false;
        this.deductionComponents= new Array();
        this.totalItems = 0;
      }
    );
  }

  saveDeductionComponent(){
    this.saveLoader = true;
    this._salaryComponentService.saveDeductionComponent(this.selecteDeductionComponent).subscribe((response) => {
        if(response.status){
          this.getOrganizationDeductionComponent();
          this._helperService.showToast('Deduction component saved successfully.',Key.TOAST_STATUS_SUCCESS);  
        }else{
          this._helperService.showToast('Error saving deduction component.',Key.TOAST_STATUS_ERROR);
        }
        this.backFromDeduction();
        this.saveLoader = false;
      },
      (error) => {
        this.saveLoader = false;
      }
    );

 }


  editDeduction(deductionComponent : DeductionComponent){
    this.toggle=true;
    this.selectedNewDeduction = false;
    this.isNewComponent = false;
    this.selectedTab = this.DEDUCTION_COMPONENT;
    this.selecteDeductionComponent= JSON.parse(JSON.stringify(deductionComponent)) ;
  }

  backFromDeduction(){
    this.toggle = false;
    this.selectedNewDeduction = false;
     this.isNewComponent = false;
     this.selecteDeductionComponent=new DeductionComponent;
  }


 deleteDeductionComponent(){
   this.saveLoader=true;
   this._salaryComponentService.deletedeductionComponent(this.componentId).subscribe((response) => {
     if(response.status){
       this._helperService.showToast('Component deleted successfully.',Key.TOAST_STATUS_SUCCESS);  

     }else{
       this._helperService.showToast('Error Deleting component.',Key.TOAST_STATUS_ERROR);

     }
     this.saveLoader=false;
     this.deleteComponentCloseButton.nativeElement.click();
     this.getOrganizationDeductionComponent();
     this.saveLoader = false;
   },
   (error) => {
     this._helperService.showToast('Error Deleting component.',Key.TOAST_STATUS_ERROR);
     this.saveLoader = false;
     this.deleteComponentCloseButton.nativeElement.click();

   }
 );
 }








































/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                                         // 
//                                                                       REIMBURSEMENT COMPONENT                                                                           // 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  reimbursementComponents:ReimbursementComponent[] = new Array();
  defaultReimbursementComponents:ReimbursementComponent[] = new Array();
  selectedReimbursementComponent!:ReimbursementComponent;
  selectedNewReimursement:boolean=false;
  getDefaultReimbursementComponent(){
        this.selectedReimbursementComponent = new ReimbursementComponent();
       this._salaryComponentService.getDefaultReimbursementComponent().subscribe((response) => {
           if(response.status){
             this.defaultReimbursementComponents= response.object;
             
           }
           this.selectedNewReimursement = true;
         },
         (error) => {
         }
       );
  }


  
  getOrganizationReimbursementComponent(){
  this.shimmer = true;
  this.reimbursementComponents = [];
    this._salaryComponentService.getOrganizationReimbursementComponent(this.currentPage, this.itemPerPage).subscribe((response) => {
        if(response.status){
          this.reimbursementComponents= response.object.content;
          this.totalItems = response.object.totalElements;

          if(this.reimbursementComponents==null){
            this.reimbursementComponents= new Array();
            this.totalItems = 0;
          }
        }else{
          this.reimbursementComponents= new Array();
          this.totalItems = 0;
        }
        this.shimmer = false;
      },
      (error) => {
        this.shimmer = false;
        this.reimbursementComponents= new Array();
        this.totalItems = 0;
      }
    );
  }


  saveReimbursementComponent(){
    this.saveLoader = true;
    this.selectedReimbursementComponent.name = this.selectedReimbursementComponent.type;
    this._salaryComponentService.saveReimbursementComponent(this.selectedReimbursementComponent).subscribe((response) => {
        if(response.status){
          this.getOrganizationReimbursementComponent();
          this._helperService.showToast('Reimbursement component saved successfully.',Key.TOAST_STATUS_SUCCESS);
        }else{
          this._helperService.showToast('Error saving Reimbursement component.',Key.TOAST_STATUS_ERROR);

        }
        this.backFromReimursement();
        this.saveLoader = false;
      },
      (error) => {
        this.saveLoader = false;
      }
    );

  }


  editReimbursementComponent(reimbursementComponent : ReimbursementComponent){
    this.getDefaultReimbursementComponent();
    this.toggle=true;
    this.selectedNewReimursement = false;
    this.selectedTab = this.REIMBURSEMENT_COMPONENT;
    this.selectedReimbursementComponent= JSON.parse(JSON.stringify(reimbursementComponent)) ;
  }

  backFromReimursement(){
    this.toggle = false;
     this.isNewComponent = false;
     this.selectedNewReimursement = false;
     this.selectedReimbursementComponent=new ReimbursementComponent;
  }
 

  onReimbursementTypeChange(selectedType:string){
    this.selectedReimbursementComponent.type = selectedType;
  }



 deleteReimbursementComponent(){
   this.saveLoader=true;
   this._salaryComponentService.deleteReimbursementComponent(this.componentId).subscribe((response) => {
     if(response.status){
       this._helperService.showToast('Component deleted successfully.',Key.TOAST_STATUS_SUCCESS);  

     }else{
       this._helperService.showToast('Error Deleting component.',Key.TOAST_STATUS_ERROR);

     }
     this.saveLoader=false;
     this.deleteComponentCloseButton.nativeElement.click();
     this.getOrganizationReimbursementComponent();
     this.saveLoader = false;
   },
   (error) => {
     this._helperService.showToast('Error Deleting component.',Key.TOAST_STATUS_ERROR);
     this.saveLoader = false;
     this.deleteComponentCloseButton.nativeElement.click();
   }
 );
 }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  

}
