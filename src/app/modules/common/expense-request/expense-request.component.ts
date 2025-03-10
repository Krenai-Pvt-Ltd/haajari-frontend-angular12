import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { ApproveReq } from 'src/app/models/ApproveReq';
import { ExpenseType } from 'src/app/models/ExpenseType';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-expense-request',
  templateUrl: './expense-request.component.html',
  styleUrls: ['./expense-request.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseRequestComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private helperService: HelperService
  ) {}

  isModal: boolean = true;
  @Input() data: any;
  @Output() closeEvent: EventEmitter<void> = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.initializeComponent();
    }
  }
  
  ngOnInit(): void {
    this.initializeComponent(); // Call the method
  }
  
  initializeComponent(): void {
    if (!this.data) return;
  
    console.log(this.data);
    this.getExpenseType();
    this.getTags('EXPENSE');
    this.getExpense(this.data.expense);
    this.isModal = this.data.isModal !== 0;
  }
  

  close(): void {
    this.closeEvent.emit();
  }


  @ViewChild('closeApproveModal') closeApproveModal!: ElementRef;

  // Properties bound to the HTML
  userExpense: any;
  expenseTypeList: any[] = new Array();
  approveAmountChecked: boolean = false;
  approvedAmount: string = '';
  rejectDiv: boolean = false;
  approveReq: ApproveReq = new ApproveReq();
  fullPartialAmount: any = 0;
  expensePaymentType: string = 'full';
  partiallyPayment: boolean = false;
  partialAmount: any = '';
  payCashDiv: boolean = false;
  showTransactionDiv: boolean = false;
  transactionId: string = '';
  approveToggle: boolean = false;
  rejectToggle: boolean = false;
  payrollToggle: boolean = false;
  expenseCancelToggle: boolean = false;
  paymentCashYesToggle: boolean = false;
  paymentCashNoToggle: boolean = false;
  existTransactionId: boolean = false;
  currentId: number = 0;
  tags: string[] = [];
  fetchedTags: string[] = [];
  searchTag: string = '';
  tagsFilteredOptions: string[] = [];
  isTagsEditEnabled: boolean = false;
  isTagsLoading: boolean = false;

  // Methods and logic required by the HTML
  getExpenseType(): void {
    this.expenseTypeList = [];
    this.dataService.getAllExpenseType().subscribe((res: any) => {
      if (res.status) {
        this.expenseTypeList = res.object;
      }
    });
  }

  getExpense(expense: any): void {
    this.userExpense = null;
    this.rejectDiv = false;
    this.currentId = expense.id;
    this.tags = expense.tags || [];
    this.userExpense = expense;

    if (this.userExpense.partiallyPaidAmount != null) {
      this.expensePaymentType = 'partial';
      this.approveReq.isPartiallyPayment = 1;
      this.partiallyPayment = true;
    }
    this.fullPartialAmount = this.userExpense.approvedAmount - (this.userExpense.partiallyPaidAmount || 0);
    this.getExpenseType();
  }

  clearApproveModal(): void {
    this.approveAmountChecked = false;
    this.approvedAmount = '';
    this.tags = [];
    this.currentId = 0;
    this.transactionId = '';
    this.payCashDiv = false;
    this.rejectDiv = false;
    this.showTransactionDiv = false;
    this.expensePaymentType = 'full';
    this.partialAmount = '';
    this.partiallyPayment = false;
    this.approveReq.rejectionReason = '';
  }

  onApproveAmountCheckboxChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.approveAmountChecked = isChecked;
    if (!isChecked) {
      this.approvedAmount = '';
    }
  }

  approveOrDeny(id: number, statusId: number, isCashPayment: number): void {
    if (statusId === 14) this.approveToggle = true;
    else if (statusId === 15) this.rejectToggle = true;
    else if (statusId === 40) this.payrollToggle = true;
    else this.expenseCancelToggle = true;

    if (statusId === 41 && isCashPayment === 0) this.paymentCashNoToggle = true;
    else if (statusId === 41 && isCashPayment === 1) this.paymentCashYesToggle = true;

    if (isCashPayment === 1 && statusId >= 40) this.approveReq.paymentMethod = 'CASH';
    else if (isCashPayment === 0 && statusId >= 40) this.approveReq.paymentMethod = 'ONLINE';

    this.approveReq.id = id;
    this.approveReq.statusId = statusId;
    this.approveReq.amount = this.partialAmount;
    this.approveReq.transactionId = this.transactionId;
    this.approveReq.approvedAmount = this.approveAmountChecked && this.approvedAmount ? this.approvedAmount : this.userExpense.amount;

    this.dataService.updateCompanyExpense(this.approveReq).subscribe((res: any) => {
      if (res.status) {
        this.approveReq = new ApproveReq();
        this.clearApproveModal();
        this.close();
        this.closeApproveModal.nativeElement.click();
        this.approveToggle = false;
        this.rejectToggle = false;
        this.payrollToggle = false;
        this.expenseCancelToggle = false;
        this.paymentCashNoToggle = false;
        this.paymentCashYesToggle = false;
        this.helperService.showToast(res.message, Key.TOAST_STATUS_SUCCESS);
      }
    });
  }

  showExpenseRejectDiv(): void {
    this.rejectDiv = true;
  }

  showPayCashDiv(): void {
    this.payCashDiv = true;
  }

  onlineTransaction(): void {
    this.showTransactionDiv = true;
  }

  onExpensePaymentTypeChange(type: number): void {
    this.partialAmount = '';
    this.approveReq.isPartiallyPayment = type;
    if (type === 0) this.approveReq.amount = '';
    this.expensePaymentType = type === 1 ? 'partial' : 'full';
    this.partiallyPayment = type === 1;
  }

  checkTransactionId(id: number, statusId: number, isCashPayment: number): void {
    this.dataService.checkExpenseTransactionId(this.transactionId).subscribe((res: any) => {
      if (res.status && res.object) {
        this.existTransactionId = true;
      } else {
        this.existTransactionId = false;
        this.approveOrDeny(id, statusId, isCashPayment);
      }
    });
  }

  // Tags-related methods
  getTags(type: string): void {
    this.dataService.getTagsByOrganizationIdAndType(type).subscribe({
      next: (data) => {
        this.fetchedTags = data?.tagsList || [];
      },
      error: (err) => {
        console.error('Error fetching tags:', err);
      },
    });
  }

  addTag(): void {
    if (this.searchTag && !this.tags.includes(this.searchTag)) {
      this.tags.push(this.searchTag);
      this.searchTag = '';
    }
    this.tagsFilteredOptions = [];
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index !== -1) {
      this.tags.splice(index, 1);
    }
  }

  onTagsChange(value: string): void {
    this.tagsFilteredOptions = this.fetchedTags
      .filter((option) => option.toLowerCase().includes(value.toLowerCase()) && !this.tags.includes(option));
  }

  preventLeadingWhitespace(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;
    if (event.key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
  }

  saveTags(): void {
    this.isTagsLoading = true;
    this.dataService.saveTags(this.currentId, this.tags).subscribe({
      next: (response) => {
        this.isTagsLoading = false;
        this.searchTag = '';
        this.isTagsEditEnabled = false;
        this.helperService.showToast('Tags saved successfully', Key.TOAST_STATUS_SUCCESS);
      },
      error: (error) => {
        this.isTagsLoading = false;
        this.helperService.showToast('Error saving tags', Key.TOAST_STATUS_ERROR);
      },
    });
  }

  checkTagsArraysEqual(): boolean {
    if (this.tags.length !== this.fetchedTags.length) return false;
    const sortedTags = [...this.tags].sort();
    const sortedFetchedTags = [...this.fetchedTags].sort();
    return sortedTags.every((value, index) => value === sortedFetchedTags[index]);
  }

}
