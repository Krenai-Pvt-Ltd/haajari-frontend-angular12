import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { ESIContributionRate } from 'src/app/models/e-si-contribution-rate';
import { PFContributionRate } from 'src/app/models/p-f-contribution-rate';
import { SalaryCalculationMode } from 'src/app/models/salary-calculation-mode';
import { SalaryComponent } from 'src/app/models/salary-component';
import { SalaryTemplateComponentRequest } from 'src/app/models/salary-template-component-request';
import { SalaryTemplateComponentResponse } from 'src/app/models/salary-template-component-response';
import { Staff } from 'src/app/models/staff';
import { Statutory } from 'src/app/models/statutory';
import { StatutoryAttribute } from 'src/app/models/statutory-attribute';
import { StatutoryAttributeResponse } from 'src/app/models/statutory-attribute-response';
import { StatutoryRequest } from 'src/app/models/statutory-request';
import { StatutoryResponse } from 'src/app/models/statutory-response';
import { UserTeamDetailsReflection } from 'src/app/models/user-team-details-reflection';
import { ConfirmationDialogService } from 'src/app/services/confirmation-dialog.service';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-salary-setting',
  templateUrl: './salary-setting.component.html',
  styleUrls: ['./salary-setting.component.css'],
})
export class SalarySettingComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private helperService: HelperService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    window.scroll(0, 0);
    this.getAllSalaryCalculationModeMethodCall();
    this.getSalaryCalculationModeByOrganizationIdMethodCall();
    this.getPFContributionRateMethodCall();
    this.getESIContributionRateMethodCall();
    this.getAllStatutoriesMethodCall();
    this.getAllSalaryTemplateComponentByOrganizationIdMethodCall();
    this.getAllSalaryComponentsMethodCall();
  }

  //Variable for pagination
  pageNumber : number = 1;
  itemPerPage : number = 8;
  total : number = 0;
  lastPageNumber : number = 1;
  searchText : string = '';
  searchBy : string = 'name';
  sort : string = ''
  sortBy : string = 'name';
  staffs: Staff[] = [];

  CURRENT_TAB_IN_SALARY_TEMPLATE = Key.SALARY_TEMPLATE_STEP;

  SALARY_TEMPLATE_STEP = Key.SALARY_TEMPLATE_STEP;
  STAFF_SELECTION_STEP = Key.STAFF_SELECTION_STEP;

  @ViewChild('salaryTemplateTab', { static: false }) salaryTemplateTab!: ElementRef;
  @ViewChild('staffSelectionTab', { static: false }) staffSelectionTab!: ElementRef;

  //Tab navigation
  salaryTemplateTabClick(){
    this.CURRENT_TAB_IN_SALARY_TEMPLATE = Key.SALARY_TEMPLATE_STEP;
    this.resetCriteriaFilter();
  }
  
  staffSelectionTabClick(){
    this.CURRENT_TAB_IN_SALARY_TEMPLATE = Key.STAFF_SELECTION_STEP;
    this.resetCriteriaFilter();
    this.getUserByFiltersMethodCall();
  }

  goToSalaryTemplateTab(){
    this.salaryTemplateTab.nativeElement.click();
  }

  goToStaffSelectionTab(){
    this.staffSelectionTab.nativeElement.click();
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

  setStatutoryVariablesToFalse() {
    this.switchValueForPF = false;
    this.switchValueForESI = false;
    this.switchValueForProfessionalTax = false;
  }

  //Code for shimmers and placeholders
  isShimmerForSalaryCalculationMode = false;
  dataNotFoundPlaceholderForSalaryCalculationMode = false;
  networkConnectionErrorPlaceHolderForSalaryCalculationMode = false;
  preRuleForShimmersAndErrorPlaceholdersForSalaryCalculationModeMethodCall() {
    this.isShimmerForSalaryCalculationMode = true;
    this.dataNotFoundPlaceholderForSalaryCalculationMode = false;
    this.networkConnectionErrorPlaceHolderForSalaryCalculationMode = false;
  }

  isShimmerForStatutory = false;
  dataNotFoundPlaceholderForStatutory = false;
  networkConnectionErrorPlaceHolderForStatutory = false;
  preRuleForShimmersAndErrorPlaceholdersForStatutoryMethodCall() {
    this.isShimmerForStatutory = true;
    this.dataNotFoundPlaceholderForStatutory = false;
    this.networkConnectionErrorPlaceHolderForStatutory = false;
  }

  isShimmerForSalaryTemplate = false;
  dataNotFoundPlaceholderForSalaryTemplate = false;
  networkConnectionErrorPlaceHolderForSalaryTemplate = false;
  preRuleForShimmersAndErrorPlaceholdersForSalaryTemplateMethodCall() {
    this.isShimmerForSalaryTemplate = true;
    this.dataNotFoundPlaceholderForSalaryTemplate = false;
    this.networkConnectionErrorPlaceHolderForSalaryTemplate = false;
  }

  isShimmerForSalaryTemplateStaffSelection = false;
  dataNotFoundPlaceholderForSalaryTemplateStaffSelection = false;
  networkConnectionErrorPlaceHolderForSalaryTemplateStaffSelection = false;
  preRuleForShimmersAndErrorPlaceholdersForSalaryTemplateStaffSelectionMethodCall() {
    this.isShimmerForSalaryTemplateStaffSelection = true;
    this.dataNotFoundPlaceholderForSalaryTemplateStaffSelection = false;
    this.networkConnectionErrorPlaceHolderForSalaryTemplateStaffSelection = false;
  }

  //Fetching all the salary calculation mode from the database
  salaryCalculationModeList: SalaryCalculationMode[] = [];
  getAllSalaryCalculationModeMethodCall() {
    this.preRuleForShimmersAndErrorPlaceholdersForSalaryCalculationModeMethodCall();
    this.dataService.getAllSalaryCalculationMode().subscribe(
      (response) => {
        if (
          response == null ||
          response == undefined ||
          response.listOfObject == null ||
          response.listOfObject == undefined ||
          response.listOfObject.length == 0
        ) {
          this.dataNotFoundPlaceholderForSalaryCalculationMode = true;
          return;
        }
        this.salaryCalculationModeList = response.listOfObject;
      },
      (error) => {
        this.networkConnectionErrorPlaceHolderForSalaryCalculationMode = true;
      }
    );
  }

  //Fetching the salary calculation mode by organization
  selectedSalaryCalculationModeId: number = 0;
  getSalaryCalculationModeByOrganizationIdMethodCall() {
    debugger;
    this.preRuleForShimmersAndErrorPlaceholdersForSalaryCalculationModeMethodCall();
    this.dataService.getSalaryCalculationModeByOrganizationId().subscribe(
      (response) => {
        debugger;
        this.selectedSalaryCalculationModeId = response.object.id;
        this.getAllSalaryCalculationModeMethodCall();
      },
      (error) => {}
    );
  }

  //Updating the salary calculation mode
  updateSalaryCalculationModeMethodCall(salaryCalculationModeId: number) {
    debugger;
    this.confirmationDialogService.openConfirmDialog(
      () => this.proceedUpdateSalaryCalculationMode(salaryCalculationModeId),
      () => this.cancelSalaryCalculationModeUpdation()
    );
  }
  proceedUpdateSalaryCalculationMode(salaryCalculationModeId: number) {
    this.dataService
      .updateSalaryCalculationMode(salaryCalculationModeId)
      .subscribe(
        (response) => {
          this.getSalaryCalculationModeByOrganizationIdMethodCall();
          this.helperService.showToast(
            'Salary calculation mode updated successfully.',
            Key.TOAST_STATUS_SUCCESS
          );
        },
        (error) => {
          // console.log(error);
          this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
        }
      );
  }
  cancelSalaryCalculationModeUpdation() {
    console.log('Cancel check!');
  }

  //Fetching the PF contribution rates from the database
  pFContributionRateList: PFContributionRate[] = [];
  getPFContributionRateMethodCall() {
    this.dataService.getPFContributionRate().subscribe(
      (response) => {
        this.pFContributionRateList = response.listOfObject;
        // console.log(response.listOfObject);
      },
      (error) => {}
    );
  }

  eSIContributionRateList: ESIContributionRate[] = [];
  getESIContributionRateMethodCall() {
    debugger;
    this.dataService.getESIContributionRate().subscribe(
      (response) => {
        this.eSIContributionRateList = response.listOfObject;
      },
      (error) => {}
    );
  }

  //Fetching the statutories from the database
  statutoryResponseList: StatutoryResponse[] = [];
  getAllStatutoriesMethodCall() {
    this.preRuleForShimmersAndErrorPlaceholdersForStatutoryMethodCall();
    this.dataService.getAllStatutories().subscribe(
      (response) => {
        this.statutoryResponseList = response.listOfObject;
        this.setStatutoryVariablesToFalse();

        if (
          response === null ||
          response === undefined ||
          response.listOfObject === null ||
          response.listOfObject === undefined ||
          response.listOfObject.length === 0
        ) {
          this.dataNotFoundPlaceholderForStatutory = true;
        }
      },
      (error) => {
        this.networkConnectionErrorPlaceHolderForStatutory = true;
      }
    );
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

  async clickSwitch(statutoryResponse: StatutoryResponse) {
    debugger;
    if (!statutoryResponse.loading) {
      statutoryResponse.loading = true;
    }

    await this.getStatutoryAttributeByStatutoryIdMethodCall(
      statutoryResponse.id
    );

    this.statutoryRequest.id = statutoryResponse.id;
    this.statutoryRequest.name = statutoryResponse.name;
    this.statutoryRequest.switchValue = !statutoryResponse.switchValue;
    this.statutoryRequest.statutoryAttributeRequestList =
      this.statutoryAttributeResponseList;

    // console.log(this.statutoryAttributeResponseList);

    if (statutoryResponse.switchValue === false) {
      if (statutoryResponse.id == this.EPF_ID) {
        this.switchValueForPF = true;
      } else if (statutoryResponse.id == this.ESI_ID) {
        this.switchValueForESI = true;
      } else if (statutoryResponse.id == this.PROFESSIONAL_TAX_ID) {
        this.switchValueForProfessionalTax = true;
      }
    } else {
      this.enableOrDisableStatutoryMethodCall();
    }
  }

  statutoryRequest: StatutoryRequest = new StatutoryRequest();
  enableOrDisableStatutoryMethodCall() {
    this.dataService.enableOrDisableStatutory(this.statutoryRequest).subscribe(
      (response) => {
        this.setStatutoryVariablesToFalse();
        this.helperService.showToast(
          response.message,
          Key.TOAST_STATUS_SUCCESS
        );
        this.getAllStatutoriesMethodCall();
      },
      (error) => {
        this.helperService.showToast(
          'Error in updating ' + this.statutoryRequest.name,
          Key.TOAST_STATUS_ERROR
        );
        this.getAllStatutoriesMethodCall();
      }
    );
  }

  selectedPFContributionRateForEmployees: PFContributionRate = {
    id: 1,
    name: '12% of PF Wage (Unrestricted)',
    description: '',
  };

  selectedPFContributionRateForEmployers: PFContributionRate = {
    id: 1,
    name: '12% of PF Wage (Unrestricted)',
    description: '',
  };

  //Fetching statutory's attributes
  statutoryAttributeResponseList: StatutoryAttributeResponse[] = [];
  getStatutoryAttributeByStatutoryIdMethodCall(statutoryId: number) {
    debugger;
    return new Promise((resolve, reject) => {
      this.dataService
        .getStatutoryAttributeByStatutoryId(statutoryId)
        .subscribe(
          (response) => {
            this.statutoryAttributeResponseList = response.listOfObject;

            if (statutoryId == this.EPF_ID) {
              if (this.pFContributionRateList.length > 0) {
                const defaultPFContributionRate =
                  this.pFContributionRateList[0];
                this.statutoryAttributeResponseList.forEach((attr) => {
                  if (
                    attr.value === undefined ||
                    attr.value === null ||
                    attr.value === ''
                  ) {
                    attr.value = defaultPFContributionRate.name;
                  }
                });
              }
            } else if (statutoryId == this.ESI_ID) {
              this.statutoryAttributeResponseList.forEach((attr) => {
                const matchingESIRate = this.eSIContributionRateList.find(
                  (iterator) => iterator.statutoryAttribute.id === attr.id
                );
                // console.log(this.eSIContributionRateList);
                if (matchingESIRate) {
                  if (
                    attr.value === undefined ||
                    attr.value === null ||
                    attr.value === ''
                  ) {
                    attr.value = matchingESIRate.name;
                  }
                }
              });
            }
            resolve(response);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  //Disable other inputs if Employer's PF Contribution input is selected as Unirestricted
  inputsDisabled: boolean = true;
  selectPFContributionRate(
    statutoryAttribute: StatutoryAttribute,
    pFContributionRate: PFContributionRate,
    index: number
  ) {
    statutoryAttribute.value = pFContributionRate.name;

    // console.log(this.statutoryAttributeResponseList);

    if (
      index === 0 &&
      this.pFContributionRateList.indexOf(pFContributionRate) === 0
    ) {
      this.inputsDisabled = true;
    } else {
      this.inputsDisabled = false;
    }

    this.statutoryRequest.statutoryAttributeRequestList =
      this.statutoryAttributeResponseList;
  }

  shouldDisableInput(attributeIndex: number): boolean {
    return this.inputsDisabled && attributeIndex !== 0;
  }

  //register salary template with attribute

  readonly BASIC_PAY_ID = Key.BASIC_PAY_ID;
  readonly HRA_ID = Key.HRA_ID;

  salaryTemplateRegisterButtonLoader: boolean = false;
  salaryTemplateComponentRequest: SalaryTemplateComponentRequest = new SalaryTemplateComponentRequest();

  registerSalaryTemplateMethodCall() {
    debugger;
    this.salaryTemplateRegisterButtonLoader = true;

    this.salaryComponentList.forEach((item) => {
      const matchingSalaryComponent =
        this.salaryTemplateComponentRequest.salaryComponentRequestList.find(
          (salaryComponent) => salaryComponent.id === item.id
        );

      if (matchingSalaryComponent) {
        if (item.toggle && item.value != matchingSalaryComponent) {
          matchingSalaryComponent.value = item.value;
        } else {
          matchingSalaryComponent.toggle = false;
        }
      } else {
        if (item.toggle) {
          this.salaryTemplateComponentRequest.salaryComponentRequestList.push(
            item
          );
        }
      }
    });

    this.salaryTemplateComponentRequest.userUuids = this.selectedStaffsUuids;

    this.dataService
      .registerSalaryTemplate(this.salaryTemplateComponentRequest)
      .subscribe(
        (response) => {
          this.salaryTemplateRegisterButtonLoader = false;
          this.cancelSalaryTemplateModal.nativeElement.click();
          this.getAllSalaryTemplateComponentByOrganizationIdMethodCall();
          this.helperService.showToast(
            response.message,
            Key.TOAST_STATUS_SUCCESS
          );
        },
        (error) => {
          this.helperService.showToast(
            'Error while registering salary template!',
            Key.TOAST_STATUS_ERROR
          );
          this.salaryTemplateRegisterButtonLoader = false;
        }
      );
  }

  formatterPercent = (value: number): string => `${value} %`;
  parserPercent = (value: string): string => value.replace(' %', '');
  formatterDollar = (value: number): string => `$ ${value}`;
  parserDollar = (value: string): string => value.replace('$ ', '');

  //Fetching salary components
  salaryComponentList: SalaryComponent[] = [];
  getAllSalaryComponentsMethodCall() {
    this.dataService.getAllSalaryComponents().subscribe(
      (response) => {
        this.salaryComponentList = response.listOfObject;
        this.salaryComponentList.forEach((item) => {
          item.toggle = false;
          item.value = 0;
        });
        this.salaryComponentList[0].toggle = true;
        this.salaryComponentList[0].value = 100;
      },
      (error) => {}
    );
  }

  getSalaryTemplateComponentByIdMethodCall(salaryTemplateComponentId: number) {
    this.dataService
      .getSalaryTemplateComponentById(salaryTemplateComponentId)
      .subscribe(
        (response) => {
          this.salaryTemplateComponentRequest = response.object;
        },
        (error) => {}
      );
  }

  salaryTemplateComponentResponseList: SalaryTemplateComponentResponse[] = [];
  getAllSalaryTemplateComponentByOrganizationIdMethodCall() {
    debugger;
    this.preRuleForShimmersAndErrorPlaceholdersForSalaryTemplateMethodCall();
    this.dataService.getAllSalaryTemplateComponentByOrganizationId().subscribe(
      (response) => {
        this.salaryTemplateComponentResponseList = response.listOfObject;
        if (this.salaryTemplateComponentResponseList.length == 1) {
          this.activeIndex = 0;
        }

        if (
          response === undefined ||
          response === null ||
          response.listOfObject.length === 0 ||
          response.listOfObject === undefined ||
          response.listOfObject === null
        ) {
          this.dataNotFoundPlaceholderForSalaryTemplate = true;
        }
      },
      (error) => {
        this.networkConnectionErrorPlaceHolderForSalaryTemplate = true;
      }
    );
  }

  @ViewChild('salaryTemplateModal') salaryTemplateModal!: ElementRef;
  @ViewChild('cancelSalaryTemplateModal')
  cancelSalaryTemplateModal!: ElementRef;
  updateSalaryTemplateComponentBySalaryTemplateId(salaryTemplateComponentResponse: SalaryTemplateComponentResponse, type : string) {
    
    this.salaryTemplateComponentRequest.id = salaryTemplateComponentResponse.id;
    this.salaryTemplateComponentRequest.name = salaryTemplateComponentResponse.name;
    this.salaryTemplateComponentRequest.description = salaryTemplateComponentResponse.description;
    this.salaryTemplateComponentRequest.salaryComponentRequestList = salaryTemplateComponentResponse.salaryComponentResponseList;
    this.salaryTemplateComponentRequest.userUuids = salaryTemplateComponentResponse.userUuids;
    this.selectedStaffsUuids = salaryTemplateComponentResponse.userUuids;

    salaryTemplateComponentResponse.salaryComponentResponseList.forEach(
      (salaryComponentResponse) => {
        const matchingSalaryComponent = this.salaryComponentList.find(
          (salaryComponent) => salaryComponent.id === salaryComponentResponse.id
        );
        if (matchingSalaryComponent) {
          matchingSalaryComponent.value = salaryComponentResponse.value;
          matchingSalaryComponent.toggle = true;
        }
      }
    );

    this.salaryComponentList.sort(
      (a, b) => (b.toggle ? 1 : 0) - (a.toggle ? 1 : 0)
    );

    if(type == this.STAFF_SELECTION_STEP){
      this.staffSelectionTab.nativeElement.click();
    }
  }

  clearSalaryTemplateModal() {
    this.salaryTemplateComponentRequest = new SalaryTemplateComponentRequest();
    this.getAllSalaryComponentsMethodCall();
    this.resetCriteriaFilter();
    this.selectedStaffsUuids = [];
    this.getUserByFiltersMethodCall();
    this.isAllUsersSelected = false;
    this.salaryTemplateTab.nativeElement.click();
  }

  // toggleSalaryComponent(salaryComponent: SalaryComponent): void {
  //   if (salaryComponent.toggle) {
  //     salaryComponent.value = salaryComponent.previousValue;
  //   } else {
  //     salaryComponent.previousValue = salaryComponent.value;
  //     salaryComponent.value = 0;
  //   }
  // }

  deleteSalaryTemplateByIdMethodCall(salaryTemplateId: number) {
    this.dataService.deleteSalaryTemplateById(salaryTemplateId).subscribe(
      (response) => {
        this.helperService.showToast(
          response.message,
          Key.TOAST_STATUS_SUCCESS
        );
        this.getAllSalaryTemplateComponentByOrganizationIdMethodCall();
      },
      (error) => {
        this.helperService.showToast(
          'Error in deleting salary template!',
          Key.TOAST_STATUS_ERROR
        );
      }
    );
  }

  activeIndex: number | null = null;

  toggleCollapse(index: number): void {
    if (this.activeIndex === index) {
      this.activeIndex = null;
      this.activeIndex = index;
    }
  }



// ##### Staff selection ############

  // Selection functionality
  isAllUsersSelected: boolean = false;
  selectedStaffsUuids: string[] = [];
  selectedStaffs: Staff[] = [];
  isAllSelected: boolean = false;
  totalUserCount: number = 0

  //Method to select all the user
  selectAll(checked: boolean) {
    this.isAllSelected = checked;
    this.staffs.forEach((staff) => (staff.selected = checked));

    // Update the selectedStaffsUuids based on the current page selection
    if (checked) {
      this.staffs.forEach((staff) => {
        if (!this.selectedStaffsUuids.includes(staff.uuid)) {
          this.selectedStaffsUuids.push(staff.uuid);
        }
      });
    } else {
      this.staffs.forEach((staff) => {
        if (this.selectedStaffsUuids.includes(staff.uuid)) {
          this.selectedStaffsUuids = this.selectedStaffsUuids.filter(
            (uuid) => uuid !== staff.uuid
          );
        }
      });
    }

    this.checkIndividualSelection();
  }

  //Method to select all users on a page
  selectAllUsers(event: any) {
    const isChecked = event.target.checked;
    this.isAllSelected = isChecked; // Make sure this reflects the change on the current page
    this.staffs.forEach((staff) => (staff.selected = isChecked));

    if (isChecked) {
      // If selecting all, add all user UUIDs to the selectedStaffsUuids list
      this.getAllUserUuidsMethodCall().then((allUuids) => {
        this.selectedStaffsUuids = allUuids;
      });
    } else {
      this.selectedStaffsUuids = [];
    }
  }

  //Method to unselect all users
  unselectAllUsers() {
    this.isAllUsersSelected = false;
    this.isAllSelected = false;
    this.staffs.forEach((staff) => (staff.selected = false));
    this.selectedStaffsUuids = [];
  }

  checkIndividualSelection() {
    this.isAllUsersSelected = this.staffs.every((staff) => staff.selected);
    this.isAllSelected = this.isAllUsersSelected;
    this.updateSelectedStaffs();
  }

  checkAndUpdateAllSelected() {
    this.isAllSelected =
      this.staffs.length > 0 && this.staffs.every((staff) => staff.selected);
    this.isAllUsersSelected = this.selectedStaffsUuids.length === this.total;
  }

  updateSelectedStaffs() {
    this.staffs.forEach((staff) => {
      if (staff.selected && !this.selectedStaffsUuids.includes(staff.uuid)) {
        this.selectedStaffsUuids.push(staff.uuid);
      } else if (
        !staff.selected &&
        this.selectedStaffsUuids.includes(staff.uuid)
      ) {
        this.selectedStaffsUuids = this.selectedStaffsUuids.filter(
          (uuid) => uuid !== staff.uuid
        );
      }
    });

    this.checkAndUpdateAllSelected();
  }

  //Method to search users
  searchUsers() {
    this.getUserByFiltersMethodCall();
  }

  //Method to clear search text
  clearSearchText() {
    this.searchText = '';
    this.getUserByFiltersMethodCall();
  }

  //Method to get user list by pagination
  getUserByFiltersMethodCall() {
    this.staffs = [];
    this.preRuleForShimmersAndErrorPlaceholdersForSalaryTemplateStaffSelectionMethodCall();
    this.dataService.getUsersByFilter(this.itemPerPage, this.pageNumber, 'asc', 'id', this.searchText, '', this.selectedTeamId)
      .subscribe(
        (response) => {
          if(response.users == undefined || response.users == null || response.users.length == 0){
            this.dataNotFoundPlaceholderForSalaryTemplateStaffSelection = true;
            this.isShimmerForSalaryTemplateStaffSelection = false;
          }
          this.staffs = response.users.map((staff: Staff) => ({
            ...staff,
            selected: this.selectedStaffsUuids.includes(staff.uuid),
          }));
          
          if (this.selectedTeamId == 0 && this.searchText == '') {
            this.totalUserCount = response.count;
          }
          this.total = response.count;
          this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
          this.pageNumber = Math.min(this.pageNumber, this.lastPageNumber);
          this.isAllSelected = this.staffs.every((staff) => staff.selected);

          this.isShimmerForSalaryTemplateStaffSelection = false;
          this.checkIndividualSelection();
        },
        (error) => {
          console.error(error);
          this.isShimmerForSalaryTemplateStaffSelection = false;
          this.networkConnectionErrorPlaceHolderForSalaryTemplateStaffSelection = true;
        }
      );
  }

  // Fetching all the uuids of the users by organization
  allUserUuids: string[] = [];
  async getAllUserUuidsMethodCall() {
    return new Promise<string[]>((resolve, reject) => {
      this.dataService.getAllUserUuids().subscribe({
        next: (response) => {
          this.allUserUuids = response.listOfObject;
          resolve(this.allUserUuids);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }


  //Reset criteria filter
  resetCriteriaFilter() {
    this.itemPerPage = 8;
    this.pageNumber = 1;
    this.lastPageNumber = 0;
    this.total = 0;
    this.sort = 'asc';
    this.sortBy = 'id';
    this.searchText = '';
    this.searchBy = 'name';
  }


  selectedTeamName: string = 'All';
  selectedTeamId: number = 0;
  page = 0;
  selectTeam(teamId: number) {
    debugger;
    if (teamId === 0) {
      this.selectedTeamName = 'All';
    } else {
      const selectedTeam = this.teamNameList.find(
        (team) => team.teamId === teamId
      );
      this.selectedTeamName = selectedTeam ? selectedTeam.teamName : 'All';
    }
    this.page = 0;
    this.itemPerPage = 10;
    // this.fullLeaveLogs = [];
    // this.selectedTeamName = teamName;
    this.selectedTeamId = teamId;
    this.getUserByFiltersMethodCall();
  }

  teamNameList: UserTeamDetailsReflection[] = [];
  teamId: number = 0;
  getTeamNames() {
    debugger;
    this.dataService.getAllTeamNames().subscribe({
      next: (response: any) => {
        this.teamNameList = response.object;
      },
      error: (error) => {
        console.error('Failed to fetch team names:', error);
      },
    });
  }

  // Pagination
  changePage(page: number | string) {
    if (typeof page === 'number') {
      this.pageNumber = page;
    } else if (page === 'prev' && this.pageNumber > 1) {
      this.pageNumber--;
    } else if (page === 'next' && this.pageNumber < this.totalPages) {
      this.pageNumber++;
    }

    this.getUserByFiltersMethodCall();
  }

  getPages(): number[] {
    const totalPages = Math.ceil(this.total / this.itemPerPage);
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.itemPerPage);
  }
  getStartIndex(): number {
    return (this.pageNumber - 1) * this.itemPerPage + 1;
  }
  getEndIndex(): number {
    const endIndex = this.pageNumber * this.itemPerPage;
    return endIndex > this.total ? this.total : endIndex;
  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
  }
}
