import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
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
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
  constructor(
    private dataService: DataService,
    private helperService: HelperService,
    private cdr: ChangeDetectorRef,
  ) { }

  uuid:any
  ngOnInit(): void {
    this.uuid= this.data.uuid;
    this.getRequestedData(this.uuid, this.data.id | 0);
  }

  requestedData: any[] = [];
    isRequestedDataLoading: boolean = false;
    userId: string = '';
    editedName: string = '';
    editedDate: Date = new Date();
    profilePic: string = '';
    disabledStates: boolean[] = [];
    approveStates: string[]=[];
    rejectedReason: string = '';
    @ViewChildren('collapsibleDiv') collapsibleDivs!: QueryList<ElementRef>;
    getRequestedData(uuid: string, id: number = 0): void {
      debugger;
      this.isRequestedDataLoading = true;
      this.dataService.getDataComparison(uuid, id).subscribe(
        (response: any) => {
          this.isRequestedDataLoading = false;
          this.userId = uuid;
            this.requestedData = response.editedDataDtoList.map((item: { key: string; }) => ({
              ...item,
              name: this.convertKeyToName(item.key)
            }));
            this.editedName= response.name;
            this.editedDate= response.createdDate;
            this.profilePic= response.profilePic;
            this.userId= response.uuid;
            this.approveStates=[];
            this.remainingField=1;
            this.isModalOpen = new Array(this.requestedData.length).fill(false);
            if(!this.requestedData ||this.requestedData.length==0){
              this.helperService.showToast('No data found', Key.TOAST_STATUS_ERROR);
              this.closeReqDataModal.nativeElement.click();
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
      // Convert the key by splitting on uppercase letters and joining with spaces
      return key
        .replace(/([a-z])([A-Z])/g, '$1 $2')  // Adds a space before uppercase letters
        .replace(/^./, (str) => str.toUpperCase()); // Capitalizes the first letter
    }

    @ViewChild('closeReqDataModal') closeReqDataModal!: ElementRef;
    approveLoading: boolean = false;
    approveRequestedData(): void {
      this.approveLoading = true;
      this.dataService.saveRequestedData(this.userId).subscribe({
        next: (response) => {
          this.approveLoading = false;
          console.log('Response:', response);
          if (response.success) {
            this.helperService.showToast('Data saved successfully', Key.TOAST_STATUS_SUCCESS);
            this.closeReqDataModal.nativeElement.click();


          } else {
            this.helperService.showToast('Failed to save data', Key.TOAST_STATUS_ERROR);
          }
        },
        error: (error) => {
          this.approveLoading = false;
          console.error('Error:', error);
          this.helperService.showToast('An error occurred while saving data', Key.TOAST_STATUS_ERROR);
        },
      });
    }

    rejectLoading: boolean = false;
    isRejectModalOpen: boolean = false;
    rejectData(): void {
      if(! this.isRejectModalOpen){
        this.isRejectModalOpen = true;
        return;
      }

      this.rejectLoading = true;
      this.dataService.rejectRequestedData(this.userId,this.rejectedReason).subscribe(
        (response) => {
          this.rejectLoading = false;
          if (response.success) {
            this.helperService.showToast('Request rejected successfully', Key.TOAST_STATUS_SUCCESS);
            this.closeReqDataModal.nativeElement.click();
          } else {
            this.helperService.showToast('Failed to reject request', Key.TOAST_STATUS_ERROR);
          }
        },
        (error) => {
          this.rejectLoading = false;
          console.error('API Error:', error);
        }
      );
    }

    @ViewChild('divElement', { static: false }) divElement!: ElementRef;

    fieldLoading: boolean = false;
    remainingField: number=1;
    removeField(key: string, value: any, index: number) {
      this.fieldLoading = true;
      this.dataService.removeKeyValuePair(key,this.userId, value).subscribe({
        next: (response) => {
          this.fieldLoading = false;
          console.log('Response:', response);
          if (response.success) {
            this.helperService.showToast('Data Rejected successfully', Key.TOAST_STATUS_SUCCESS);
            this.remainingField=response.message;
            if(this.remainingField==0){
              this.closeReqDataModal.nativeElement.click();
            }
            this.disabledStates[index] = true;
            this.approveStates[index] = 'Rejected';
            this.divElement.nativeElement.click();
            const divToClick = document.getElementById('collapsibleDiv-' + index);
            if (divToClick) {
              divToClick.click();
            }

          } else {
            this.helperService.showToast('Failed to remove the field', Key.TOAST_STATUS_ERROR);
          }
        },
        error: (err) => {
          this.fieldLoading = false;
          console.error('Error:', err);
          alert('An error occurred while removing the field.');
        }
      });
    }
    approveField(key: string, value: any, index: number) {
      this.fieldLoading = true;
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      this.dataService.approveKeyValuePair(key, this.userId, stringValue).subscribe({
        next: (response) => {
          this.fieldLoading = false;
          console.log('Response:', response);
          if (response.success) {
            this.disabledStates[index] = true;
            this.approveStates[index] = 'Approved';
            this.remainingField=response.message;
            if(this.remainingField==0){
              this.closeReqDataModal.nativeElement.click();
            }
            const divToClick = document.getElementById('collapsibleDiv-' + index);
            if (divToClick) {
              divToClick.click();
            }
            this.helperService.showToast('Field approve successfully', Key.TOAST_STATUS_SUCCESS);

          } else {
            this.helperService.showToast('Failed to approve the field', Key.TOAST_STATUS_ERROR);
          }
        },
        error: (err) => {
          this.fieldLoading = false;
          console.error('Error:', err);
          alert('An error occurred while removing the field.');
        }
      });
    }

    closeDataRequestModal() {
      this.requestedData = [];
      this.userId = '';
      this.fieldLoading = false;
      this.isRequestedDataLoading = false;
      this.disabledStates = [];
      this.approveStates = [];
      this.isRejectModalOpen = false;
      this.rejectedReason = '';
    }

}
