import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
import { Key } from 'src/app/constant/key';
import { ApproveReq } from 'src/app/models/ApproveReq';
import { CompanyExpense } from 'src/app/models/CompanyExpense';
import { CompanyExpensePolicyRes } from 'src/app/models/CompanyExpensePolicyRes';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { ExpensePolicy } from 'src/app/models/ExpensePolicy';
import { ExpenseType } from 'src/app/models/ExpenseType';
import { Staff } from 'src/app/models/staff';
import { UserTeamDetailsReflection } from 'src/app/models/user-team-details-reflection';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-create-expense',
  templateUrl: './create-expense.component.html',
  styleUrls: ['./create-expense.component.css']
})
export class CreateExpenseComponent implements OnInit {
  
  ROLE: any
  // isLoading: boolean = false;

  constructor(private afStorage: AngularFireStorage,
    private dataService: DataService, private helperService: HelperService, private rbacService: RoleBasedAccessControlService) { 

    }

  ngOnInit(): void {
    this.getExpenses();
    this.getAllCompanyExpensePolicy();
    
  }


  expenseList: any[] = new Array();
  loading: boolean = false;
  async getExpenses() {
    debugger
    this.loading = true;
    this.expenseList = []
    this.ROLE = await this.rbacService.getRole();

    this.dataService.getAllExpense(this.ROLE, 1, 10).subscribe((res: any) => {
      if (res.status) {
        this.expenseList = res.object
        this.loading = false
      }
    })
  }


  /** Expense start **/

  expenseTypeList: any[] = new Array();
  expenseTypeReq: ExpenseType = new ExpenseType();
  expenseTypeId: number = 0;
  getExpenseTypeId(id: any) {
    this.expenseTypeReq.expenseTypeId = id
  }

  getExpenseType() {

    this.expenseTypeReq = new ExpenseType();
    this.expenseTypeId = 0

    this.expenseTypeList = []
    this.dataService.getExpenseType().subscribe((res: any) => {

      if (res.status) {
        this.expenseTypeList = res.object;
      }

    }, error => {
      console.log('something went wrong')
    })
  }

  // Watch for changes in the expense date for the custom date range
  isExpenseDateSelected: boolean = true;
  isCustomDateRange: boolean = false;
  selectExpenseDate(startDate: Date) {
    if (this.isCustomDateRange && startDate) {
      this.expenseTypeReq.expenseDate = this.helperService.formatDateToYYYYMMDD(startDate);
    }
  }

  validatePolicyToggle: boolean = false;
  limitAmount: any;
  checkExpensePolicy(form: NgForm) {
    this.dataService.checkExpensePolicy(this.expenseTypeReq.expenseTypeId, this.expenseTypeReq.amount).subscribe((res: any) => {
      this.limitAmount = res.object;

      if (this.limitAmount > 0) {
        this.validatePolicyToggle = true;
      } else {
        this.createExpense(form);
      }
    })
  }

  setValidateToggle() {
    this.validatePolicyToggle = false;
  }

  @ViewChild('closeExpenseButton') closeExpenseButton!: ElementRef
  createToggle: boolean = false;
  createExpense(form: NgForm) {
    this.createToggle = true;

    this.dataService.createExpense(this.expenseTypeReq).subscribe((res: any) => {
      if (res.status) {
        this.expenseTypeReq = new ExpenseType();
        this.expenseTypeId = 0;
        this.expenseTypeReq.id = 0;
        this.validatePolicyToggle = false;
        form.resetForm();
        this.getExpenses();
        this.createToggle = false;
        this.closeExpenseButton.nativeElement.click()
        this.helperService.showToast(res.message, Key.TOAST_STATUS_SUCCESS);
      }
    })

    console.log('createExpense Req: ', this.expenseTypeReq)
    // this.expenseTypeReq = new ExpenseType();

    // this.expenseTypeId = 0;
    // this.validatePolicyToggle = false;
    // form.resetForm();
    // this.getExpenses();

    // this.closeExpenseButton.nativeElement.click()
    // console.log('Created Successfully')
  }

  async updateExpense(expense: any) {
    await this.getExpenseType();

    this.expenseTypeReq.id = expense.id
    this.expenseTypeReq.amount = expense.amount
    this.expenseTypeReq.expenseDate = expense.expenseDate
    this.expenseTypeReq.expenseTypeId = expense.expenseTypeId
    this.expenseTypeReq.notes = expense.notes
    this.expenseTypeId = expense.expenseTypeId
  }

  clearExpenseForm(form: NgForm) {
    this.expenseTypeReq = new ExpenseType();
    this.expenseTypeId = 0;
    this.validatePolicyToggle = false;
    form.resetForm();
  }

  deleteImage() {
    this.expenseTypeReq.url = ''
  }

  expenseId: number = 0;
  getExpenseId(id: number) {
    this.expenseId = id;
    console.log('id: ', this.expenseId)
  }

  deleteToggle: boolean = false
  @ViewChild('closeButtonDeleteExpense') closeButtonDeleteExpense!: ElementRef
  deleteExpense() {

    this.dataService.deleteExpense(this.expenseId).subscribe((res: any) => {
      if (res.status) {
        this.closeButtonDeleteExpense.nativeElement.click()
        this.getExpenses();
        this.helperService.showToast(
          'Expense deleted successfully.',
          Key.TOAST_STATUS_SUCCESS
        );
      }
    })
  }

  // Function to disable future dates
  disableFutureDates = (current: Date): boolean => {
    const today = new Date();
    // Disable dates after today
    return current && current >= today;
  };

  userExpense: any;
  getExpense(expense: any) {
    this.userExpense = expense
  }

  isCheckboxChecked: boolean = false
  partialAmount: string = '';
  onCheckboxChange(checked: boolean): void {
    this.isCheckboxChecked = checked;
    if (!checked) {
      this.partialAmount = '';
    }
  }

  clearApproveModal() {
    this.isCheckboxChecked = false;
    this.partialAmount = '';
  }

  approveReq: ApproveReq = new ApproveReq();
  approveToggle: boolean = false;
  @ViewChild('closeApproveModal') closeApproveModal!: ElementRef
  approveOrDeny(id: number, statusId: number) {

    debugger
    this.approveToggle = true;
    this.approveReq.id = id;
    this.approveReq.statusId = statusId
    this.approveReq.amount = this.partialAmount
    this.dataService.updateCompanyExpense(this.approveReq).subscribe((res: any) => {
      if(res.status){
        this.approveReq = new ApproveReq();
        this.getExpenses();
        this.isCheckboxChecked = false;
        this.partialAmount = '';
        this.closeApproveModal.nativeElement.click()
        this.approveToggle = false
        this.helperService.showToast(
          res.message,
          Key.TOAST_STATUS_SUCCESS
        );
      }
    })

  }

  /** Company Expense end **/

  /**
   * Create Expense Policy Start
   */

  // switch tab start

  activeTab: string = 'expensePolicy';

  // Method to switch tabs
  switchTab(tabName: string) {
    this.activeTab = tabName;
  }

  @ViewChild('expenseTypeTab') expenseTypeTab!: ElementRef;
  isStaffSelectionFlag: boolean = false;
  expenseTypeSelectionTab() {
    this.expenseTypeTab.nativeElement.click();
    this.isStaffSelectionFlag = false;
    this.activeTab = 'expensePolicy';
  }

  @ViewChild('staffActiveTabInShiftTiming')
  staffActiveTabInShiftTiming!: ElementRef;
  staffActiveTabInShiftTimingMethod() {
    this.getUserByFiltersMethodCall();
    this.getTeamNames();

    this.staffActiveTabInShiftTiming.nativeElement.click();
  }

  /** Create Expense Policy */

  expenseTypeName: string = ''
  isExpenseTypeSelected: boolean = false;
  paymentType: string = ''; // Holds the selected payment type ('fixed' or 'flexible')
  flexibleAmount: number | null = null; // Holds the amount for flexible payment type
  selectExpenseType(expense: any) {
    console.log('expense: ', expense)
    this.expenseTypeName = expense.name
    this.expenseTypeId = expense.id

    this.isExpenseTypeSelected = true;
    this.paymentType = ''; // Reset payment type when a new expense type is selected
    this.flexibleAmount = null; // Reset amount for flexible payment type
  }

  type: number = 0;
  onPaymentTypeChange(type: number): void {
    this.type = type;
    if (this.paymentType === 'fixed') {
      this.flexibleAmount = null; // Clear flexible amount if "Fixed" is selected
    }
  }

  // staff selection
  itemPerPage: number = 8;
  pageNumber: number = 1;
  lastPageNumber: number = 0;
  total!: number;
  page = 0;
  itemsPerPage = 6;
  isLoading = false;
  totalCount: number = 0;
  rowNumber: number = 1;
  searchText: string = '';
  staffs: Staff[] = [];
  selectedTeamName: string = 'All';
  selectedTeamId: number = 0;
  teamNameList: UserTeamDetailsReflection[] = [];
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
    this.databaseHelper = new DatabaseHelper();
    // this.fullLeaveLogs = [];
    // this.selectedTeamName = teamName;
    this.selectedTeamId = teamId;
    this.getUserByFiltersMethodCall();
  }

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

  //User selection in staff selection tab
  selectedStaffsUuids: string[] = [];
  selectedStaffs: Staff[] = [];
  isAllSelected: boolean = false;
  totalUserCount: number = 0;
  staffLoading: boolean = false;
  getUserByFiltersMethodCall() {
    debugger;
    // this.staffs = [];
    this.staffLoading = true;
    // this.dataService.getUsersByFilter(this.itemPerPage,this.pageNumber,'asc', 'id',this.searchText,'',this.selectedTeamId
    this.dataService.getUsersByFilter(this.databaseHelper.itemPerPage ,this.databaseHelper.currentPage ,'asc', 'id',this.searchText,'',this.selectedTeamId
      ).subscribe(
        (response) => {
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
          this.staffLoading = false
          // console.log(this.staffs);
        },
        (error) => {
          console.error(error);
        }
      );
  }

  searchUsers() {
    this.getUserByFiltersMethodCall();
  }

  clearSearchText() {
    this.searchText = '';
    this.getUserByFiltersMethodCall();
  }

  isAllUsersSelected: boolean = false;
  allselected: boolean = false;
  selectedStaffIds: number[] = [];

  // Method to toggle all users' selection
  selectAllUsers(isChecked: boolean) {

    this.isAllUsersSelected = isChecked;
    this.isAllSelected = isChecked; // Make sure this reflects the change on the current page
    this.staffs.forEach((staff) => (staff.selected = isChecked)); // Update each staff's selected property

    if (isChecked) {
      // If selecting all, add all user UUIDs to the selectedStaffIds list
      this.getAllUsersUuids().then((allUuids) => {
        this.selectedStaffIds = allUuids;
      });
    } else {
      this.selectedStaffIds = [];
    }
  }

  selectAllEmployee() {
    if (!this.allselected) {
      this.staffs.forEach((element) => {
        this.selectedStaffIdsUser.push(element.id);
        element.checked = true;
      });
      this.allselected = true;
    } else {
      this.staffs.forEach((element: any) => {
        element.checked = false;
      });
      this.allselected = false;
      this.selectedStaffIdsUser = [];
    }
    // console.log('all Ids: ', this.selectedStaffIdsUser)

    this.selectedStaffIdsUser = Array.from(new Set(this.selectedStaffIdsUser));
    // console.log('After SET Ids: ',this.selectedStaffIdsUser)

  }

  selectAll(checked: boolean) {
    debugger

    this.isAllSelected = checked;
    this.staffs.forEach((staff) => (staff.selected = checked));

    // Update the selectedStaffIds based on the current page selection
    if (checked) {

      this.staffs.forEach((staff) => {
        if (!this.selectedStaffIds.includes(staff.id)) {
          this.selectedStaffIds.push(staff.id);
        }
      });
    } else {
      this.staffs.forEach((staff) => {
        if (this.selectedStaffIds.includes(staff.id)) {
          this.selectedStaffIds = this.selectedStaffIds.filter(
            (uuid) => uuid !== staff.id
          );
        }
      });
    }

    // console.log('sel all Ids: ', this.selectedStaffIds)

  }

  // Asynchronous function to get all user UUIDs
  selectedStaffIdsUser: number[] = [];
  idOfLeaveSetting: number = 0

  async getAllUsersUuids(): Promise<number[]> {
    const response = await this.dataService
      .getUsersByFilterForLeaveSetting(
        this.total,
        1,
        'asc',
        'id',
        this.searchText,
        '',
        this.idOfLeaveSetting,
        this.selectedTeamId,
        this.selectedStaffIdsUser
      )
      .toPromise();

    return response.users.map((userDto: any) => userDto.user.id);
  }

  // Call this method when the select all users checkbox value changes
  onSelectAllUsersChange(event: any) {
    this.selectAllUsers(event.target.checked);
  }

  unselectAllUsers() {
    this.isAllUsersSelected = false;
    this.isAllSelected = false;
    this.staffs.forEach((staff) => (staff.selected = false));
    this.selectedStaffIds = [];
    this.selectedStaffIdsUser = []
  }

  clearIds() {
    this.selectedStaffIdsUser = []
    this.staffs.forEach((staff, index) => {
      staff.checked = false;
    });
    this.allselected = false;
    this.showAllUser();

  }

  // ##### Pagination ############
  changePage(page: number | string) {
    this.allselected = false;
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

  /** switch tab end */


  // Submit Expense Policy Form
  submitExpensePolicy() {

  }

  deSelectedStaffIdsUser: number[] = [];
  selectSingle(event: any, i: any) {
    debugger
    if (event.checked) {
      this.allselected = false;

      this.deSelectedStaffIdsUser.push(event.id)

      this.staffs[i].checked = false;
      var index = this.selectedStaffIdsUser.indexOf(event.id);
      this.selectedStaffIdsUser.splice(index, 1);

      console.log('deSelectedStaffIdsUser: ', this.deSelectedStaffIdsUser)

      if (this.selectedStaffIdsUser.length == 0 && this.showMappedUserToggle) {
        this.showAllUser();
      }

    } else {
      this.staffs[i].checked = true;
      this.selectedStaffIdsUser.push(event.id);

      if (this.deSelectedStaffIdsUser.includes(event.id)) {
        const index = this.deSelectedStaffIdsUser.indexOf(event.id);
        if (index > -1) {
          this.deSelectedStaffIdsUser.splice(index, 1);
        }
      }

      if (this.selectedStaffIdsUser.length == this.staffs.length) {
        this.allselected = true;
      }

      console.log('selectedIds: ', this.selectedStaffIdsUser)
      // console.log('del: ', this.deSelectedStaffIdsUser)
    }

  }

  showAllUser() {
    this.showMappedUserToggle = false;
    this.selectedUserIds = []
    this.getUserByFiltersMethodCall();
  }

  selectedStaffList: Staff[] = [];
  selectedUserIds: number[] = [];
  showMappedUserToggle: boolean = false;
  showMappedUser() {
    this.showMappedUserToggle = true;
    this.selectedUserIds = this.selectedStaffIdsUser

    this.getUserByFiltersMethodCall();

    // console.log('sele staff', this.staffs);
  }


  //Pagination
  databaseHelper: DatabaseHelper = new DatabaseHelper();
  totalItems: number = 0;
  pageChanged(page: any) {
    if (page != this.databaseHelper.currentPage) {
      this.databaseHelper.currentPage = page;
      this.getUserByFiltersMethodCall();
    }
  }


  /**
   * Image upload start on Firebase
   */

  /** Image Upload on the Firebase Start */

  isFileSelected = false;
  imagePreviewUrl: any = null;
  selectedFile: any;
  isUploading: boolean = false;
  fileName: any;
  onFileSelected(event: Event): void {
    debugger;
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];

      this.fileName = file.name;
      // Check if the file type is valid
      if (this.isValidFileType(file)) {
        this.selectedFile = file;
        this.isUploading = true;

        const reader = new FileReader();
        reader.onload = (e: any) => {
          // Set the loaded image as the preview
          this.imagePreviewUrl = e.target.result;
        };
        reader.readAsDataURL(file);

        this.uploadFile(file);

        console.log('url is', this.expenseTypeReq.url)

      } else {
        element.value = '';
        this.expenseTypeReq.url = '';
        // Handle invalid file type here (e.g., show an error message)
        console.error(
          'Invalid file type. Please select a jpg, jpeg, or png file.'
        );
      }
    } else {
      this.isFileSelected = false;
    }
  }

  // Helper function to check if the file type is valid
  isInvalidFileType = false;
  isValidFileType(file: File): boolean {
    const validExtensions = ['jpg', 'jpeg', 'png'];
    const fileType = file.type.split('/').pop(); // Get the file extension from the MIME type

    if (fileType && validExtensions.includes(fileType.toLowerCase())) {
      this.isInvalidFileType = false;
      return true;
    }
    // console.log(this.isInvalidFileType);
    this.isInvalidFileType = true;
    return false;
  }


  uploadFile(file: File): void {
    debugger;
    const filePath = `expense/${new Date().getTime()}_${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);

    task
      .snapshotChanges()
      .toPromise()
      .then(() => {
        // console.log('Upload completed');
        fileRef
          .getDownloadURL()
          .toPromise()
          .then((url) => {
            console.log('File URL:', url);
            this.isUploading = false;
            this.expenseTypeReq.url = url;
          })
          .catch((error) => {
            console.error('Failed to get download URL', error);
          });
      })
      .catch((error) => {
        console.error('Error in upload snapshotChanges:', error);
      });

    console.log('upload url is: ', this.expenseTypeReq.url)
  }

  /** Image Upload on Firebase End */

  /**
   * Create Expense Policy
   * we can edit/delete from expesenList by index
   */

  expensePolicyReqList: ExpensePolicy[] = [];
  expensePolicyReq: ExpensePolicy = new ExpensePolicy();
  tempPolicyName: string = ''
  policyAmount: string = ''
  isErrorShow: boolean = true;
  addExpensePolicy(form: NgForm){
    debugger
    this.tempPolicyName = this.policyName;

    // this.expensePolicyReq.name = this.policyName
    this.expensePolicyReq.paymentType = this.type
    this.expensePolicyReq.limitAmount = this.flexibleAmount == null ? 0 : this.flexibleAmount
    this.expensePolicyReq.expenseTypeId = this.expenseTypeId
    this.expensePolicyReq.expenseTypeName = this.expenseTypeName
    this.expensePolicyReq.amount = Number(this.policyAmount)

    this.expensePolicyReqList.push(this.expensePolicyReq)

    this.expensePolicyReq = new ExpensePolicy();

    console.log('add Policy: ',this.expensePolicyReq)

    this.expenseTypeName = this.tempPolicyName
    this.expenseTypeId = 0
    this.expenseTypeName = ''
    this.isExpenseTypeSelected = false;
    this.policyAmount = ''
    this.paymentType = ''; // Reset payment type when a new expense type is selected
    this.flexibleAmount = null; // Reset amount for flexible payment type
    console.log('Request: ',this.expensePolicyReqList)
    this.isErrorShow = false;
    // form.resetForm()
    // this.tempPolicyName = this.policyName
  }

  clearForm(form: NgForm){
    this.clearPolicyForm();
    form.resetForm()
  }
  
  policyName: string = ''
  companyExpenseReq: CompanyExpense = new CompanyExpense();
  registerToggle: boolean = false
  @ViewChild('closeExpensePolicyModal') closeExpensePolicyModal!: ElementRef
  registerCompanyExpense(form: NgForm) {
    debugger

    this.registerToggle = true;
    this.companyExpenseReq.policyName = this.tempPolicyName;
    this.companyExpenseReq.expensePolicyList = this.expensePolicyReqList
    this.companyExpenseReq.selectedUserIds = this.selectedStaffIdsUser;

    console.log('Create: ',this.companyExpenseReq)

    this.dataService.createExpensePolicy(this.companyExpenseReq).subscribe((res: any) => {
      if(res.status){
        this.closeExpensePolicyModal.nativeElement.click()
        form.resetForm()
        this.clearPolicyForm();
        this.getAllCompanyExpensePolicy()
        this.registerToggle = false
        this.helperService.showToast(res.message, Key.TOAST_STATUS_SUCCESS);
      }
    })

  }

  clearPolicyForm(){
    this.companyExpenseReq = new CompanyExpense();
    this.expensePolicyReqList = []
    this.selectedStaffIdsUser = []
    this.expenseTypeId = 0;
    this.expenseTypeId = 0
    this.expenseTypeName = ''
    this.isExpenseTypeSelected = false;
    this.allselected = false;
    this.policyName = ''
    this.tempPolicyName = ''
    this.paymentType = ''; 
    this.flexibleAmount = null; 
    this.expenseTypeSelectionTab();

  }

  deleteExpensePolicy(index: number){
    this.expensePolicyReqList.splice(index, 1);

  }

  updateToggle: boolean = false
  editExpensePolicy(index: number){
    const item = this.expensePolicyReqList[index];

    // this.expensePolicyReq.name = this.policyName
    this.expensePolicyReq.paymentType = this.type
    this.expensePolicyReq.limitAmount = this.flexibleAmount == null ? 0 : this.flexibleAmount
    this.expensePolicyReq.expenseTypeId = this.expenseTypeId
    this.expensePolicyReq.expenseTypeName = this.expenseTypeName
  }

  companyExpensePolicyList: CompanyExpensePolicyRes[] = [];
  // companyExpensePolicyList: CompanyExpensePolicyRes = new CompanyExpensePolicyRes();
  getAllCompanyExpensePolicy(){
    // this.companyExpensePolicyList = 
    this.isLoading = true;
    this.databaseHelper.currentPage = 1;
    this.databaseHelper.itemPerPage = 10;
    this.dataService.getAllCompanyExpensePolicy(this.databaseHelper).subscribe((res: any) => {
      if(res.status){
        // this.companyExpensePolicyList = res.object
        this.companyExpensePolicyList = res.object
      }
      this.isLoading = false;
      console.log('lsit: ',this.companyExpensePolicyList)
    })
  }

  activeIndex: number | null = null;
  toggleCollapse(index: number): void {
    this.activeIndex = this.activeIndex === index ? null : index;
  }

  expensePolicyId: number = 0;
  expensePolicyTypeId: number = 0;
  expenseAppliedCount: number = 0;
  getExpensePolicyOrExpensePolicyTypeId(id: number, isExpensePolicy: boolean, expenseAppliedCount: number) {
    // this.leaveTemplateCategoryId = id;
    // this.leaveAppliedUserCount = leaveAppliedUserCount;

    if (isExpensePolicy) {
      this.expensePolicyTypeId = 0;
      this.expensePolicyId = id;
    } else {
      this.expensePolicyId = 0;
      this.expensePolicyTypeId = id;
    }
  }

  deletePolicyToggle: boolean = false
  deleteExpensePolicyById(){

  }

  deleteExpensePolicyTypeById(){

  }

  getExpenseInformationById(id: number, flag: boolean){

  }

}
