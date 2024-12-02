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
    this.switchTab('allExpense');
  }

  selectedDate: Date = new Date();
  startDate: string = '';
  endDate: string = '';

  expenseList: any[] = new Array();
  loading: boolean = false;
  async getExpenses() {
    debugger
    this.loading = true;
    this.expenseList = []
    this.ROLE = await this.rbacService.getRole();

    this.dataService.getAllExpense(this.ROLE, this.databaseHelper.currentPage, this.databaseHelper.itemPerPage, this.startDate, this.endDate).subscribe((res: any) => {
      if (res.status) {
        this.expenseList = res.object
        this.loading = false
      }else{
        this.expenseList = []
        this.loading = false
      }
    })
  }


  /** Expense start **/
  clearData(){
    debugger
    this.companyExpensePolicyId = 0
    this.tempExpPolicyId = 0;
    this.oldSelectedStaffIdsUser = []
    this.companyExpenseReq = new CompanyExpense();
  }

  expenseTypeList: any[] = new Array();
  expenseTypeReq: ExpenseType = new ExpenseType();
  expenseTypeId: number = 0;
  getExpenseTypeId(id: any) {
    this.expenseTypeReq.expenseTypeId = id
  }

  getExpenseType1() {

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

  getExpenseType() {

    this.expenseTypeReq = new ExpenseType();
    this.expenseTypeId = 0

    this.expenseTypeList = []
    this.dataService.getAllExpenseType().subscribe((res: any) => {

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
  rejectToggle: boolean = false;

  payrollToggle: boolean = false;
  expenseCancelToggle: boolean = false;
  @ViewChild('closeApproveModal') closeApproveModal!: ElementRef
  approveOrDeny(id: number, statusId: number) {

    debugger

    if(statusId == 14){
      this.approveToggle = true;
    }else if(statusId == 15){
      this.rejectToggle = true;
    }else if(statusId == 40){
      this.payrollToggle = true;
    }else{
      this.expenseCancelToggle = true;
    }

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
        this.rejectToggle = false

        this.payrollToggle = false
        this.expenseCancelToggle = false

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

    if(tabName === 'allExpense'){
      this.getExpenses()
    }

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
    // this.expenseTypeName = expense.name
    this.expenseTypeId = expense

//     const selectedExpense = this.expenseTypeList.find(expense => expense.id === expense);
// console.log('selectedExpense', selectedExpense);
const selectedExpense = this.getDefaultExpenseType(expense);
console.log('selectedExpense', selectedExpense);
this.expenseTypeName = selectedExpense.name
    

    // this.isExpenseTypeSelected = true;
    // this.paymentType = ''; 
    // this.flexibleAmount = null; 
    this.isExpenseTypeSelected = true;
    if(!this.editIndexPolicyToggle){
       this.isExpenseTypeSelected = true;
    this.paymentType = ''; 
    this.flexibleAmount = null; 
    }

    // console.log('typeId expenseTypeName: ',this.expenseTypeName)

  }


  selectExpenseType1(expense: any) {
    console.log('expense: ', expense)
    this.expenseTypeName = expense.name
    this.expenseTypeId = expense.id

    // this.isExpenseTypeSelected = true;
    // this.paymentType = '';
    // this.flexibleAmount = null;
    this.isExpenseTypeSelected = true;
    if(!this.editIndexPolicyToggle){
       this.isExpenseTypeSelected = true;
    this.paymentType = '';
    this.flexibleAmount = null;
    }

    console.log('typeId: ',this.expenseTypeId)
    console.log('typeId expenseTypeName: ',this.expenseTypeName)

  }

  type: number = 0;
  onPaymentTypeChange(type: number, paymentType: string): void {
    this.type = type;
    this.expensePolicyReq.isFixed = paymentType
    this.paymentType = paymentType;
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
  getUserByFiltersMethodCall1() {
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

  getUserByFiltersMethodCall(){
    debugger
      this.selectedStaffIds = [];
      this.staffLoading = true;

      this.dataService.getUsersByFilter(this.databaseHelper.itemPerPage ,this.databaseHelper.currentPage ,'asc', 'id',this.searchText,'',this.selectedTeamId)
        .subscribe(
          (response) => {

            this.staffs = response.users;

            if (this.staffs != undefined) {
              this.staffs.forEach((staff, index) => {
                staff.checked = this.selectedStaffIdsUser.includes(staff.id);
              });
            } else {
              this.staffs = []
            }

            this.total = response.count;

            this.isAllSelected = this.staffs.every((staff) => staff.selected);

            if (this.selectedTeamId == 0 && this.searchText == '') {
              this.totalUserCount = response.count;
            }
            this.total = response.count;
            this.lastPageNumber = Math.ceil(this.total / this.itemPerPage);
            this.pageNumber = Math.min(this.pageNumber, this.lastPageNumber);
            this.isAllSelected = this.staffs.every((staff) => staff.selected);
            this.staffLoading = false

            // console.log('staffs: ', this.staffs)
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

      // if(this.updateToggle){
      //   this.deSelectedStaffIdsUser.push(event.id)
      // }

      if(this.updateToggle && this.oldSelectedStaffIdsUser.includes(event.id)){
        this.deSelectedStaffIdsUser.push(event.id)
      }

      this.staffs[i].checked = false;
      var index = this.selectedStaffIdsUser.indexOf(event.id);
      this.selectedStaffIdsUser.splice(index, 1);

      // console.log('deSelectedStaffIdsUser: ', this.deSelectedStaffIdsUser)

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

      if(this.updateToggle){
        this.tempCompanyExpenseReq.deSelectedUserIds = this.deSelectedStaffIdsUser
      }

      // console.log('selectedIds: ', this.selectedStaffIdsUser)
      // console.log('del: ', this.deSelectedStaffIdsUser)
    }

    console.log('selectedIds: ', this.selectedStaffIdsUser)
    console.log('del: ', this.deSelectedStaffIdsUser)

  }

  selectSingle1(event: any, i: any) {
    debugger
    if (event.checked) {
      this.allselected = false;

      if(this.updateToggle){
        this.deSelectedStaffIdsUser.push(event.id)
      }

      this.staffs[i].checked = false;
      var index = this.selectedStaffIdsUser.indexOf(event.id);
      this.selectedStaffIdsUser.splice(index, 1);

      // console.log('deSelectedStaffIdsUser: ', this.deSelectedStaffIdsUser)

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
    }

    console.log('selectedIds: ', this.selectedStaffIdsUser)
    console.log('del: ', this.deSelectedStaffIdsUser)

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
    this.allselected = false;
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
      this.expensePolicyReq.paymentType = this.type
      this.expensePolicyReq.limitAmount = this.flexibleAmount == null ? 0 : this.flexibleAmount
      this.expensePolicyReq.expenseTypeId = this.expenseTypeId
      this.expensePolicyReq.expenseTypeName = this.expenseTypeName
      this.expensePolicyReq.amount = Number(this.policyAmount)

      // this.paymentType = item.isFixed
      // this.thresholdType = item.isPercent
      // this.isThresholdSelected = item.isThresold

      // this.expensePolicyReq.paymentType = this.paymentType
      this.expensePolicyReq.isPercent = this.thresholdType == null ? '' : this.thresholdType
      this.expensePolicyReq.isThresold = this.isThresholdSelected
      this.expensePolicyReq.isFixed = this.paymentType
      this.expensePolicyReq.isPercentage = (this.thresholdType === 'value' ? 0 : 1 )
      this.policyAmount = this.policyAmount
      this.flexibleAmount = this.flexibleAmount

    if(!this.editIndexPolicyToggle){
      this.expensePolicyReqList.push(this.expensePolicyReq)
    }else{
      this.expensePolicyReqList[this.editIndex] = this.expensePolicyReq;
    }

    this.expensePolicyReq = new ExpensePolicy();
    this.expenseTypeName = this.tempPolicyName
    this.expenseTypeId = 0
    this.expenseTypeName = ''
    this.isExpenseTypeSelected = false;
    this.editIndexPolicyToggle = false;
    this.policyAmount = ''
    this.paymentType = '';
    this.flexibleAmount = null;
    this.editIndex = 0

    this.isErrorShow = false;
    this.resetThresholdOptions()
  }

  clearForm(form: NgForm){
    // this.companyExpensePolicyId = 0;
    // this.companyExpenseReq.id = 0
    // this.companyExpenseReq = new CompanyExpense();
    // this.tempCompanyExpenseReq = new CompanyExpense();
    this.clearPolicyForm();
    form.resetForm()
  }

  policyName: string = ''
  companyExpenseReq: CompanyExpense = new CompanyExpense();
  registerToggle: boolean = false
  @ViewChild('closeExpensePolicyModal') closeExpensePolicyModal!: ElementRef
   registerCompanyExpense1(form: NgForm) {
    debugger

    this.registerToggle = true;
    this.companyExpenseReq.policyName = this.tempPolicyName;
    this.companyExpenseReq.expensePolicyList = this.expensePolicyReqList
    this.companyExpenseReq.selectedUserIds = this.selectedStaffIdsUser;
    this.companyExpenseReq.deSelectedUserIds = this.deSelectedStaffIdsUser;

    console.log('Create: ',this.companyExpenseReq)

    // this.dataService.createExpensePolicy(this.companyExpenseReq).subscribe((res: any) => {
    //   if(res.status){
    //     this.closeExpensePolicyModal.nativeElement.click()
    //     form.resetForm()
    //     this.clearPolicyForm();
    //     this.getAllCompanyExpensePolicy()
    //     this.resetThresholdOptions()
    //     this.registerToggle = false
    //     if(this.isMappedUserModalOpen){
    //       this.usersAlreadyAssigned?.nativeElement.click();
    //       this.isMappedUserModalOpen = false
    //     }
    //     this.helperService.showToast(res.message, Key.TOAST_STATUS_SUCCESS);
    //   }
    // })

  }

  registerCompanyExpense(form: NgForm) {
    debugger

    this.registerToggle = true;

    if(this.isMappedUserModalOpen){
      this.companyExpenseReq.policyName = this.tempCompanyExpenseReq.policyName;
      this.companyExpenseReq.expensePolicyList = this.tempCompanyExpenseReq.expensePolicyList
      // this.companyExpenseReq.selectedUserIds = this.tempCompanyExpenseReq.selectedUserIds;
      this.companyExpenseReq.selectedUserIds = this.tempSelectedStaffIdsUser
      this.companyExpenseReq.deSelectedUserIds = this.tempCompanyExpenseReq.deSelectedUserIds;

    }else{
      // this.companyExpenseReq.id = 0
      this.companyExpensePolicyId = 0;
      this.companyExpenseReq.id = 0
      this.companyExpenseReq.policyName = this.tempPolicyName;
      this.companyExpenseReq.expensePolicyList = this.expensePolicyReqList
      this.companyExpenseReq.selectedUserIds = this.selectedStaffIdsUser;
      this.companyExpenseReq.deSelectedUserIds = this.deSelectedStaffIdsUser;
    }

    if(this.updateToggle){
      this.companyExpenseReq.id = this.companyExpensePolicyId
      this.companyExpenseReq.policyName = this.pName
      // this.companyExpenseReq.removeUserIds = this.removeUserIds

      // combined which I have deselect from user list and I have select from duplicate user
      if (this.removeUserIds && this.removeUserIds.length > 0) {
        this.companyExpenseReq.deSelectedUserIds = [
          ...this.companyExpenseReq.deSelectedUserIds,
          ...this.removeUserIds
        ];
      }
    }

    if(this.tempExpPolicyId > 0){
      this.companyExpenseReq.id = this.tempExpPolicyId
    }

    // console.log('Create: ',this.companyExpenseReq)
    //      this.closeExpensePolicyModal.nativeElement.click()
    //     form.resetForm()
    //     this.clearPolicyForm();
    //     this.getAllCompanyExpensePolicy()
    //     this.resetThresholdOptions()
    //     this.registerToggle = false
    //     this.userMappedLoading = false;
    //     this.updateToggle = false;
    //     this.isValidated = false;
    //     this.tempSelectedStaffIdsUser = []
    //     this.oldSelectedStaffIdsUser = []

    //     this.companyExpensePolicyId = 0
    //     this.companyExpenseReq.id = 0
    //     this.tempExpPolicyId = 0
    //     this.policyName = ''
    //     this.tempPolicyName = ''
    //     if(this.isMappedUserModalOpen){
    //       this.usersAlreadyAssigned?.nativeElement.click();
    //       this.isMappedUserModalOpen = false
    //     }

    //     this.companyExpenseReq = new CompanyExpense();
    //     this.tempCompanyExpenseReq = new CompanyExpense();
    //     this.helperService.showToast('created', Key.TOAST_STATUS_SUCCESS);


    this.dataService.createExpensePolicy(this.companyExpenseReq).subscribe((res: any) => {
      if(res.status){
        this.closeExpensePolicyModal.nativeElement.click()
        form.resetForm()
        this.clearPolicyForm();
        this.getAllCompanyExpensePolicy()
        this.resetThresholdOptions()
        this.registerToggle = false
        this.userMappedLoading = false;
        this.updateToggle = false;
        this.isValidated = false;
        this.companyExpensePolicyId = 0
        this.companyExpenseReq.id = 0
        this.tempSelectedStaffIdsUser = []
        this.oldSelectedStaffIdsUser = []
        this.policyName = ''
        this.tempPolicyName = ''
        this.tempExpPolicyId = 0
        this.pName = ''
        if(this.isMappedUserModalOpen){
          this.usersAlreadyAssigned?.nativeElement.click();
          this.isMappedUserModalOpen = false
        }
        this.companyExpenseReq = new CompanyExpense();
        this.tempCompanyExpenseReq = new CompanyExpense();
        this.helperService.showToast(res.message, Key.TOAST_STATUS_SUCCESS);
      }else{
        this.clearPolicyForm();
        this.companyExpensePolicyId = 0
        this.companyExpenseReq.id = 0
      }
    })

  }

  registerCompanyExpenseWork(form: NgForm) {
    debugger

    this.registerToggle = true;

    if(this.isMappedUserModalOpen){
      this.companyExpenseReq.policyName = this.tempCompanyExpenseReq.policyName;
      this.companyExpenseReq.expensePolicyList = this.tempCompanyExpenseReq.expensePolicyList
      // this.companyExpenseReq.expensePolicyList = this.tempExpensePolicyReqList
      this.companyExpenseReq.selectedUserIds = this.tempCompanyExpenseReq.selectedUserIds;
      this.companyExpenseReq.deSelectedUserIds = this.tempCompanyExpenseReq.deSelectedUserIds;

    }else{
      // this.companyExpenseReq.id = 0
      this.companyExpenseReq.policyName = this.tempPolicyName;
      this.companyExpenseReq.expensePolicyList = this.expensePolicyReqList
      this.companyExpenseReq.selectedUserIds = this.selectedStaffIdsUser;
      this.companyExpenseReq.deSelectedUserIds = this.deSelectedStaffIdsUser;
    }

    if(this.updateToggle){
      this.companyExpenseReq.id = this.companyExpensePolicyId
      this.companyExpenseReq.policyName = this.pName
      // this.companyExpenseReq.removeUserIds = this.removeUserIds

      // combined which I have deselect from user list and I have select from duplicate user
      if (this.removeUserIds && this.removeUserIds.length > 0) {
        this.companyExpenseReq.deSelectedUserIds = [
          ...this.companyExpenseReq.deSelectedUserIds,
          ...this.removeUserIds
        ];
      }

    }

    console.log('Create: ',this.companyExpenseReq)
         this.closeExpensePolicyModal.nativeElement.click()
        form.resetForm()
        this.clearPolicyForm();
        this.getAllCompanyExpensePolicy()
        this.resetThresholdOptions()
        this.registerToggle = false
        this.userMappedLoading = false;
        this.updateToggle = false;
        this.isValidated = false;

        this.companyExpensePolicyId = 0
        this.companyExpenseReq.id = 0
        this.policyName = ''
        this.tempPolicyName = ''
        if(this.isMappedUserModalOpen){
          this.usersAlreadyAssigned?.nativeElement.click();
          this.isMappedUserModalOpen = false
        }

        this.companyExpenseReq = new CompanyExpense();
        this.tempCompanyExpenseReq = new CompanyExpense();
        this.helperService.showToast('created', Key.TOAST_STATUS_SUCCESS);


    // this.dataService.createExpensePolicy(this.companyExpenseReq).subscribe((res: any) => {
    //   if(res.status){
    //     this.closeExpensePolicyModal.nativeElement.click()
    //     form.resetForm()
    //     this.clearPolicyForm();
    //     this.getAllCompanyExpensePolicy()
    //     this.resetThresholdOptions()
    //     this.registerToggle = false
    //     this.userMappedLoading = false;
    //     this.updateToggle = false;
    //     this.isValidated = false;
    //     this.companyExpensePolicyId = 0
    //     this.companyExpenseReq.id = 0
    //     this.policyName = ''
    //     this.tempPolicyName = ''
    //     this.pName = ''
    //     if(this.isMappedUserModalOpen){
    //       this.usersAlreadyAssigned?.nativeElement.click();
    //       this.isMappedUserModalOpen = false
    //       // this.tempCompanyExpenseReq = new CompanyExpense();
    //     }
    //     this.companyExpenseReq = new CompanyExpense();
    //     this.tempCompanyExpenseReq = new CompanyExpense();
    //     this.helperService.showToast(res.message, Key.TOAST_STATUS_SUCCESS);
    //   }else{
    //     this.clearPolicyForm();
    //     this.companyExpensePolicyId = 0
    //     this.companyExpenseReq.id = 0
    //   }
    // })

  }

  clearPolicyForm(){
    this.companyExpenseReq = new CompanyExpense();
    // this.tempCompanyExpenseReq = new CompanyExpense();

    this.expensePolicyReqList = []
    this.selectedStaffIdsUser = []
    this.deSelectedStaffIdsUser = []
    this.expenseTypeId = 0;
    this.expenseTypeId = 0
    this.expenseTypeName = ''
    this.isExpenseTypeSelected = false;
    this.allselected = false;
    this.policyName = ''
    this.tempPolicyName = ''
    this.paymentType = '';
    this.flexibleAmount = null;
    // this.companyExpensePolicyId = 0
    this.expenseTypeSelectionTab();

  }

  deleteExpensePolicy(index: number){
    this.expensePolicyReqList.splice(index, 1);

  }

  updateToggle: boolean = false
  editIndexPolicyToggle: boolean = false;
  editIndex: number = 0
  async editExpensePolicy(index: number){
    debugger
    this.editIndexPolicyToggle = true;
    this.editIndex = index;
    const item = this.expensePolicyReqList[index];

    console.log('update item: ',item)

    const defaultExpenseType = this.getDefaultExpenseType(item.expenseTypeId);

    this.selectExpenseType(defaultExpenseType)
    this.expensePolicyReq.paymentType = item.paymentType
    this.expensePolicyReq.limitAmount = item.limitAmount
    this.expensePolicyReq.expenseTypeId = item.expenseTypeId
    this.policyAmount = item.amount.toString()
    // this.paymentType = this.paymentType
    // this.isThresholdSelected = this.isThresholdSelected
    this.flexibleAmount = item.limitAmount
    // this.thresholdType = this.thresholdType
    // this.expensePolicyReq.expenseTypeName = this.expenseTypeName

    this.paymentType = item.isFixed
    this.thresholdType = item.isPercent
    this.isThresholdSelected = item.isThresold

    console.log('update expensePolicyReq: ',this.expensePolicyReq)
  }

   getDefaultExpenseType(id: number) {
    return this.expenseTypeList.find(expense => expense.id === id);
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
    if (isExpensePolicy) {
      this.expensePolicyTypeId = 0;
      this.expensePolicyId = id;
    } else {
      this.expensePolicyId = 0;
      this.expensePolicyTypeId = id;
    }
  }

  deletePolicyToggle: boolean = false
  @ViewChild('closeButtonDeleteExpensePolicy') closeButtonDeleteExpensePolicy!: ElementRef
  deleteExpensePolicyById(){
    this.deletePolicyToggle = true;
    this.dataService.deleteCompanyExpensePolicy(this.expensePolicyId).subscribe((res: any) => {
      if(res.status){
          this.expensePolicyId = 0;
          this.deletePolicyToggle = false;
          this.getAllCompanyExpensePolicy();
          this.closeButtonDeleteExpensePolicy.nativeElement.click()
      }
    })
  }

  deleteExpensePolicyTypeById(){
    this.deletePolicyToggle = true;
    this.dataService.deleteCompanyExpenseTypePolicy(this.expensePolicyTypeId).subscribe((res: any) => {
      if(res.status){
          this.expensePolicyTypeId = 0;
          this.deletePolicyToggle = false;
          this.getAllCompanyExpensePolicy();
          this.closeButtonDeleteExpensePolicy.nativeElement.click()
      }
    })
  }

  // getExpenseInformationById(id: number, flag: boolean){

  // }


  thresholdType: string | null = null;
  thresholdAmount: number =0;
  onThresholdTypeChange(isPercentagFlag: number, type: string): void {
    this.thresholdType = type;
    this.expensePolicyReq.isPercentage = isPercentagFlag
    this.expensePolicyReq.isPercent = type

    this.thresholdAmount = 0; // Reset threshold amount when changing type
    console.log('thresold Type: ',this.expensePolicyReq.isPercentage)
  }

  private resetThresholdOptions(): void {
    this.isThresholdSelected = false;
    this.thresholdType = null;
    this.thresholdAmount = 0;
    this.flexibleAmount = null
    this.expensePolicyReq.isPercentage
  }


  isThresholdSelected: boolean = false;
  setThresold(isChecked: boolean): void {
    this.isThresholdSelected = isChecked;
    this.expensePolicyReq.isThresold = isChecked

    if(!isChecked){
      this.resetThresholdOptions()
    }
  }



  /** User already mapped  */
  closeModal(){

  }

  userNameWithBranchName: any[] = new Array();
  @ViewChild("closeButton") closeButton!:ElementRef;

  @ViewChild('usersAlreadyAssigned') usersAlreadyAssigned!: ElementRef
  tempSelectedStaffIdsUser: number[] = [];
  isMappedUserModalOpen: boolean = false;
  userMappedLoading: boolean = false;

  tempCompanyExpenseReq: CompanyExpense = new CompanyExpense();
  tempExpensePolicyReqList: ExpensePolicy[] = [];
  pName: string = ''
  getUserMappedWithPolicy(form: NgForm){
    debugger
    this.userMappedLoading = true;
    this.userNameWithBranchName = []
    this.dataService.getUserMappedWithPolicy(this.selectedStaffIdsUser, this.companyExpensePolicyId).subscribe((response: any) => {

      if(response.status){
        this.userNameWithBranchName = response.object;
        this.tempSelectedStaffIdsUser = this.selectedStaffIdsUser

        // Add temp request for create expense
        // this.tempExpensePolicyReqList = this.expensePolicyReqList
        this.pName = this.policyName
      this.tempCompanyExpenseReq.policyName = this.tempPolicyName;
      this.tempCompanyExpenseReq.expensePolicyList = this.expensePolicyReqList
      this.tempCompanyExpenseReq.selectedUserIds = this.selectedStaffIdsUser

      this.tempCompanyExpenseReq.deSelectedUserIds = this.userNameWithBranchName.map(item => item.id);

      }

      console.log('userLen: ',this.userNameWithBranchName.length)
        if( this.userNameWithBranchName.length != 0) {
          this.isMappedUserModalOpen = true;
          // console.log('Opening modal..')
          this.closeExpensePolicyModal.nativeElement.click();
          this.usersAlreadyAssigned.nativeElement.click();
          this.userMappedLoading = false;
        }else{
          // console.log('Going to create..')
          this.registerCompanyExpense(form);
        }

      },
      (error:any) => {
        console.log('error');
      }
    );
  }


  remainingIds: number[] = [];
  removeUserIds: number[] = [];
  removeUser(userId: number) {
    debugger

    // if(!this.updateToggle){
    //   this.deSelectedStaffIdsUser = []
    // }

    console.log('temp req: ',this.tempCompanyExpenseReq)

    this.tempSelectedStaffIdsUser = this.tempSelectedStaffIdsUser.filter(
      (id) => id != userId
    );

    // Update the 'selected' status for each staff member based on selectedStaffIdsUser
    this.userNameWithBranchName = this.userNameWithBranchName.filter(
      (staff) => staff.id !== userId
    );

  // Create a new list with only the IDs of the remaining items
   this.remainingIds = this.userNameWithBranchName.map((staff) => staff.id);

    this.selectedStaffIdsUser = this.tempSelectedStaffIdsUser


    if(this.updateToggle){
      this.removeUserIds = this.remainingIds;
      this.tempCompanyExpenseReq.removeUserIds = this.removeUserIds;
    }else{
      this.deSelectedStaffIdsUser = this.remainingIds
      this.tempCompanyExpenseReq.deSelectedUserIds = this.deSelectedStaffIdsUser;
    }

    this.tempCompanyExpenseReq.selectedUserIds = this.selectedStaffIdsUser;

    // if(this.removeUserIds.length > 0){
    //   if (this.tempCompanyExpenseReq.selectedUserIds.includes(userId)) {
    //     const index = this.tempCompanyExpenseReq.selectedUserIds.indexOf(userId);
    //     if (index > -1) {
    //       this.tempCompanyExpenseReq.selectedUserIds.splice(index, 1);
    //     }
    //   }
    // }

    // this.tempCompanyExpenseReq.deSelectedUserIds = this.deSelectedStaffIdsUser;
  }


  removeUser1(userId: number) {
    debugger
    this.deSelectedStaffIdsUser = []

    console.log('temp req: ',this.tempCompanyExpenseReq)

    this.tempSelectedStaffIdsUser = this.tempSelectedStaffIdsUser.filter(
      (id) => id != userId
    );

    // Update the 'selected' status for each staff member based on selectedStaffIdsUser
    this.userNameWithBranchName = this.userNameWithBranchName.filter(
      (staff) => staff.id !== userId
    );

  // Create a new list with only the IDs of the remaining items
   this.remainingIds = this.userNameWithBranchName.map((staff) => staff.id);

    this.selectedStaffIdsUser = this.tempSelectedStaffIdsUser
    this.deSelectedStaffIdsUser = this.remainingIds

    if(this.updateToggle){
      this.removeUserIds = this.remainingIds;
    }

    this.tempCompanyExpenseReq.selectedUserIds = this.selectedStaffIdsUser;
    this.tempCompanyExpenseReq.deSelectedUserIds = this.deSelectedStaffIdsUser;
  }

  isValidated: boolean = false;
  checkValidation() {
    this.isValidated ? false : true;
  }


  /** User already mapped end */

  oldSelectedStaffIdsUser: number[] = []
  getExpenseInformationById1(companyExpense: CompanyExpensePolicyRes){

      debugger
      this.updateToggle = true;
      this.expensePolicyReq = new ExpensePolicy()

      console.log('expense obj: ',companyExpense)

      // const item = this.expensePolicyReqList[index];

      // console.log('update item: ',item)

      // const defaultExpenseType = this.getDefaultExpenseType(companyExpense.companyExpensePolicyTypeRes.expenseTypeId);

      // this.expensePolicyReqList = companyExpense.companyExpensePolicyTypeRes;


      companyExpense.companyExpensePolicyTypeRes.forEach((expenseType: any) => {
        this.expensePolicyReq.paymentType = expenseType.isFlexibleAmount
        this.expensePolicyReq.limitAmount = expenseType.flexibleAmount == null ? 0 : expenseType.flexibleAmount
        this.expensePolicyReq.expenseTypeId = expenseType.expenseTypeId
        this.expensePolicyReq.expenseTypeName = expenseType.expenseTypeName
        this.expensePolicyReq.amount = Number(expenseType.amount)

        // this.expensePolicyReq.isPercent = this.thresholdType == null ? '' : this.thresholdType
        // this.expensePolicyReq.isThresold = this.isThresholdSelected
        // this.expensePolicyReq.isFixed = this.paymentType
        this.expensePolicyReq.isPercentage = expenseType.isPercentage
        // this.expensePolicyReq.isPercentage = (this.thresholdType === 'value' ? 0 : 1 )

        this.expensePolicyReqList.push(this.expensePolicyReq)
      })

      console.log('expensePolicyReqList: ',this.expensePolicyReqList)

      this.staffs.forEach((staff, index) => {
        // this.staffs[index].checked = true;
        staff.checked = companyExpense.userIds.includes(staff.id);
      });

      companyExpense.userIds.forEach((id: number) => {
        this.selectedStaffIdsUser.push(id)

      });

      this.policyName = companyExpense.policyName

      // set expense type end

      // this.selectExpenseType(defaultExpenseType)
      // this.expensePolicyReq.paymentType = item.paymentType
      // this.expensePolicyReq.limitAmount = item.limitAmount
      // this.expensePolicyReq.expenseTypeId = item.expenseTypeId
      // this.policyAmount = item.amount.toString()

      // this.flexibleAmount = item.limitAmount

      // this.paymentType = item.isFixed
      // this.thresholdType = item.isPercent
      // this.isThresholdSelected = item.isThresold

      // this.updateToggle = false;

      console.log('update expensePolicyReq: ',this.expensePolicyReq)
  }

  companyExpensePolicyId: number = 0;
  tempExpPolicyId: number =0;
  getExpenseInformationById(companyExpense: CompanyExpensePolicyRes){

    debugger
    this.updateToggle = true;
    this.companyExpensePolicyId = companyExpense.id
    this.tempExpPolicyId = companyExpense.id;

    this.expensePolicyReq = new ExpensePolicy()
    this.expensePolicyReqList = []
    this.oldSelectedStaffIdsUser = []

    // console.log('expense obj: ',companyExpense)

    companyExpense.companyExpensePolicyTypeRes.forEach((expenseType: any) => {
      // Create a new instance for each `expenseType` to avoid reference issues
      const expensePolicyReq = {
        paymentType: expenseType.isFlexibleAmount,
        limitAmount: expenseType.flexibleAmount == null ? 0 : expenseType.flexibleAmount,
        expenseTypeId: expenseType.expenseTypeId,
        expenseTypeName: expenseType.expenseTypeName,
        amount: Number(expenseType.amount),
        isPercentage: expenseType.isPercentage,
        isThresold: false,
        isFixed: (expenseType.isFlexibleAmount == 1 ? 'fixed' : ''),
        isPercent: ''
      };

      // Push the new object into the list
      this.expensePolicyReqList.push(expensePolicyReq);
    });

    // console.log('type list: ',this.expensePolicyReqList)

    this.staffs.forEach((staff) => {
      staff.checked = companyExpense.userIds.includes(staff.id);
    });

    companyExpense.userIds.forEach((id: number) => {
      this.selectedStaffIdsUser.push(id)
      this.oldSelectedStaffIdsUser.push(id)
    });

    // this.oldSelectedStaffIdsUser = this.selectedStaffIdsUser
    console.log('old sel IDS: ',this.oldSelectedStaffIdsUser)

    this.policyName = companyExpense.policyName
    this.updateToggle = true;

    // console.log('update expensePolicyReq: ',this.expensePolicyReq)
}


}
