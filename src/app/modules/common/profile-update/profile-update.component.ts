import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-profile-update',
  templateUrl: './profile-update.component.html',
  styleUrls: ['./profile-update.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileUpdateComponent implements OnInit {
  @Input() data: any;
  @Output() closeEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() fieldAction: EventEmitter<void> = new EventEmitter<void>();
  constructor(
    private dataService: DataService,
    private helperService: HelperService,
    private cdr: ChangeDetectorRef
  ) {}

  uuid: any;
  isModal: boolean = true;
  ngOnInit(): void {
    this.fetchData();
  }

  ngOnChanges(changes: SimpleChanges) {
      if (changes['data']) {
       this.fetchData();
      }
    }

    fetchData(){
      this.uuid = this.data.uuid;
    if (this.data.isModal == 0) {
      this.isModal = false;
    }
    this.getRequestedData(this.uuid, this.data.id | 0);
    }

  close() {
    this.closeDataRequestModal();
    this.closeEvent.emit();
  }

  requestedData: any[] = [];
  isRequestedDataLoading: boolean = false;
  userId: string = '';
  editedName: string = '';
  editedDate: Date = new Date();
  profilePic: string = '';
  disabledStates: boolean[] = [];
  approveStates: string[] = [];
  rejectedReason: string = '';
  fieldLoadingStates: boolean[] = []; // New array for per-field loading states
  @ViewChildren('divElement') divElements!: QueryList<ElementRef>; // Changed to ViewChildren

  getRequestedData(uuid: string, id: number = 0): void {
    this.isRequestedDataLoading = true;
    this.dataService.getDataComparison(uuid, id).subscribe(
      (response: any) => {
        this.isRequestedDataLoading = false;
        this.userId = uuid;
        if (!response) {
          this.helperService.showToast('No data found', Key.TOAST_STATUS_ERROR);
          if (this.isModal) {
            this.closeReqDataModal.nativeElement.click();
          } else {
            this.close();
          }
        }
        this.requestedData = response.editedDataDtoList.map((item: { key: string }) => ({
          ...item,
          name: this.convertKeyToName(item.key),
        }));
        this.editedName = response.name;
        this.editedDate = response.createdDate;
        this.profilePic = response.profilePic;
        this.userId = response.uuid;
        this.approveStates = [];
        this.remainingField = 1;
        this.isModalOpen = new Array(this.requestedData.length).fill(false);
        this.fieldLoadingStates = new Array(this.requestedData.length).fill(false); // Initialize loading states
        this.disabledStates = new Array(this.requestedData.length).fill(false); // Ensure disabledStates is initialized
        if (!this.requestedData || this.requestedData.length === 0) {
          this.helperService.showToast('No data found', Key.TOAST_STATUS_ERROR);
          if (this.isModal) {
            this.closeReqDataModal.nativeElement.click();
          } else {
            this.close();
          }
        }
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      },
      (error) => {
        this.isRequestedDataLoading = false;
      }
    );
  }

  isModalOpen: boolean[] = [];
  toggleModal(index: number): void {
    this.isModalOpen[index] = !this.isModalOpen[index];
  }

  convertKeyToName(key: string): string {
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, (str) => str.toUpperCase());
  }

  @ViewChild('closeReqDataModal') closeReqDataModal!: ElementRef;
  approveLoading: boolean = false;
  approveRequestedData(): void {
    this.approveLoading = true;
    this.dataService.saveRequestedData(this.userId).subscribe({
      next: (response) => {
        this.approveLoading = false;
        if (response.success) {
          this.helperService.showToast('Data saved successfully', Key.TOAST_STATUS_SUCCESS);
          this.close();

          this.closeReqDataModal.nativeElement.click();
        } else {
          this.helperService.showToast('Failed to save data', Key.TOAST_STATUS_ERROR);
        }
      },
      error: (error) => {
        this.approveLoading = false;
        this.helperService.showToast('An error occurred while saving data', Key.TOAST_STATUS_ERROR);
      },
    });
  }

  rejectLoading: boolean = false;
  isRejectModalOpen: boolean = false;
  rejectData(): void {
    if (!this.isRejectModalOpen) {
      this.isRejectModalOpen = true;
      return;
    }
    this.rejectLoading = true;
    this.dataService.rejectRequestedData(this.userId, this.rejectedReason).subscribe(
      (response) => {
        this.rejectLoading = false;
        if (response.success) {
          this.helperService.showToast('Request rejected successfully', Key.TOAST_STATUS_SUCCESS);
          this.close();
          this.closeReqDataModal.nativeElement.click();
        } else {
          this.helperService.showToast('Failed to reject request', Key.TOAST_STATUS_ERROR);
        }
      },
      (error) => {
        this.rejectLoading = false;
        this.helperService.showToast('An error occurred while rejecting the request', Key.TOAST_STATUS_ERROR);
      }
    );
  }

  fieldLoading: boolean = false;
  remainingField: number = 1;
  removeField(key: string, value: any, index: number) {
    this.fieldLoading = true;
    this.fieldLoadingStates[index] = true; // Start loading for this field
    this.dataService.removeKeyValuePair(key, this.userId, value).subscribe({
      next: (response) => {
        this.fieldLoading = false; // Stop loading
        this.fieldLoadingStates[index] = false; // Stop loading
        if (response.success) {
          this.helperService.showToast('Data Rejected successfully', Key.TOAST_STATUS_SUCCESS);
          this.remainingField = response.message;
          this.fieldAction.emit();
          if (this.remainingField === 0) {
            this.close();
            this.closeReqDataModal.nativeElement.click();
          }
          this.disabledStates[index] = true;
          this.approveStates[index] = 'Rejected';
          const divToClick = this.divElements.toArray()[index];
          if (divToClick) {
            divToClick.nativeElement.click(); // Close the collapsible div
          }
        } else {
          this.helperService.showToast('Failed to remove the field', Key.TOAST_STATUS_ERROR);
        }
      },
      error: (err) => {
        this.fieldLoading = false; // Stop loading on error
        this.fieldLoadingStates[index] = false; // Stop loading on error
        this.helperService.showToast('An error occurred while removing the field', Key.TOAST_STATUS_ERROR);
      },
    });
  }

  approveField(key: string, value: any, index: number) {
    this.fieldLoading= true;
    this.fieldLoadingStates[index] = true; // Start loading for this field
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    this.dataService.approveKeyValuePair(key, this.userId, stringValue).subscribe({
      next: (response) => {
        this.fieldLoading = false; // Stop loading
        this.fieldLoadingStates[index] = false; // Stop loading
        if (response.success) {
          this.disabledStates[index] = true;
          this.approveStates[index] = 'Approved';
          this.remainingField = response.message;
          this.fieldAction.emit();
          if (this.remainingField === 0) {
            this.close();
            this.closeReqDataModal.nativeElement.click();
          }
          const divToClick = this.divElements.toArray()[index];
          if (divToClick) {
            divToClick.nativeElement.click(); // Close the collapsible div
          }
          this.helperService.showToast('Field approved successfully', Key.TOAST_STATUS_SUCCESS);
        } else {
          this.helperService.showToast('Failed to approve the field', Key.TOAST_STATUS_ERROR);
        }
      },
      error: (err) => {
        this.fieldLoading = false; // Stop loading on error
        this.fieldLoadingStates[index] = false; // Stop loading on error
        this.helperService.showToast('An error occurred while approving the field', Key.TOAST_STATUS_ERROR);
      },
    });
  }

  closeDataRequestModal() {
    this.requestedData = [];
    this.userId = '';
    this.fieldLoadingStates = [];
    this.isRequestedDataLoading = false;
    this.disabledStates = [];
    this.approveStates = [];
    this.isRejectModalOpen = false;
    this.rejectedReason = '';
  }

  isAnyFieldLoading(): boolean {
    return this.fieldLoadingStates.some((state) => state === true);
  }
}
