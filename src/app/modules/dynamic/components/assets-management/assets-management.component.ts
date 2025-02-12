import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Key } from 'src/app/constant/key';
import { AssetRequestDTO } from 'src/app/models/AssetRequestDTO';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

interface Filter {
  type: 'team' | 'user' | 'status' | 'category';
  label: any;
  value: any;
}

@Component({
  selector: 'app-assets-management',
  templateUrl: './assets-management.component.html',
  styleUrls: ['./assets-management.component.css']
})
export class AssetsManagementComponent implements OnInit {

  constructor(
    private dataService : DataService,
    private helperService : HelperService,
     private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.getPendingRequestsCounter();
    this.dashboard();
    this.getOrganizationUserList();
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchText: string) => {
      this.searchText=searchText;
      this.loadAssets();
    });
  }

  searchControl = new FormControl('');
  assetStatuses = [
    { id: 62, name: 'ASSIGNED' },
    { id: 63, name: 'UNAVAILABLE' },
    { id: 64, name: 'AVAILABLE' },
    { id: 65, name: 'MAINTENANCE' },
    { id: 66, name: 'DAMAGED' }
  ];
  statusClassMapping: { [key: string]: string } = {
    '62': 'text-success',   // ASSIGNED
    '63': 'text-secondary',  // UNAVAILABLE
    '64': 'text-primary',    // AVAILABLE
    '65': 'text-warning',    // MAINTENANCE
    '66': 'text-danger'      // DAMAGED
  };

  dashboard(): void {
    this.fetchCategorySummary();
    this.fetchStatusSummary();

  }
  statusSummary: any[] = [];
  categorySummary: any[] = [];
  assetSummary: any[] = [];
  assetSummaryCategoryId: any = 0;
  // Separate method to fetch status summary
  fetchStatusSummary(): void {
    this.dataService.getStatusSummary().subscribe({
      next: (data) => {
        this.statusSummary = data;
        console.log('Status Summary:', data);
      },
      error: (err) => console.error('Error fetching status summary', err)
    });
  }

  getCountByStatusId(statusId: number): number {
    const status = this.statusSummary.find(s => s.statusId === statusId);
    return status ? status.assetCount : 0;
  }
  getTotalAssetCount(): number {
    return this.statusSummary.reduce((total, status) => total + status.assetCount, 0);
  }

  // Separate method to fetch category summary
  fetchCategorySummary(): void {
    this.dataService.getCategorySummary().subscribe({
      next: (data) => {
        this.categorySummary = data;
        console.log('Category Summary:', data);
        if(this.categorySummary.length>0){
          this.assetSummaryCategoryId = this.categorySummary[0].categoryId;
          this.fetchAssetSummary();
        }
      },
      error: (err) => console.error('Error fetching category summary', err)
    });
  }

  fetchAssetSummary(): void {
    this.dataService.getAssetCategorySummary(this.assetSummaryCategoryId)
      .subscribe(
        (data) => {
          this.assetSummary = data;
          console.log('Asset summary data:', data);
        },
        (error) => {
          console.error('Error fetching asset summary:', error);
        }
      );
  }

  assetData: any = {
    id: 0,
    assetName: '',
    serialNumber: '',
    purchasedDate: null,
    expiryDate: null,
    price: '',
    location: '',
    vendorName: '',
    userId: null,
    assignedDate: null,
    categoryId: ''
  };

  assetCreateLoading: boolean = false;
  @ViewChild('closeBtn') closeBtn!: ElementRef<HTMLButtonElement>;
  onSubmit(form: NgForm): void {
    this.assetCreateLoading=true;
    if (form.valid) {
      this.dataService.createAssets(this.assetData).subscribe(
        (response: any) => {
          this.assetCreateLoading=false;
          if (response.status) {
            this.closeBtn.nativeElement.click();
            this.helperService.showToast('Asset successfully created', Key.TOAST_STATUS_SUCCESS);
          } else {
            this.helperService.showToast('Asset creation failed', Key.TOAST_STATUS_ERROR);
          }
        },
        error => {
          this.assetCreateLoading = false;
          console.error('An error occurred:', error);
        }
      );
    } else {
      // Optionally mark all fields as touched to show errors
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  onCloseAddAssetModal(form: NgForm): void {
    form.resetForm();
    Object.values(form.controls).forEach(control => {
      control.markAsUntouched();
    });
  }





  // assigned assets

  assignedAssets(): void {
    this.currentPage = 1;
    this.loadAssets();
    this.fetchTeamSummary();
  }

    assets: any[] = [];
    currentPage = 1;
    pageSize = 10;
    totalItems = 0;

    isAssetLoading = false;
    loadAssets() {
      this.isAssetLoading = true;
      this.dataService.getFilteredAssets(this.selectedTeamId, this.selectedUserId, this.selectedStatusId, this.selectedCategoryId, this.searchText, this.currentPage-1, this.pageSize)
        .subscribe(response => {
          this.isAssetLoading = false;
          this.assets = response.content; // Assuming `content` holds the paginated data
          this.totalItems = response.totalElements; // Extract total pages from response
          this.activeFilterTemp= this.activeFilters;
        },
      (error) => {
        this.isAssetLoading=false;
        console.error('Error fetching assets', error);
      });
    }
    assetsPageChange(page: number): void {
      this.currentPage = page;
      this.loadAssets();
    }
    totalAssignedAssets: number = 0;
    teamSummary: any= [];
    statusId: number = 62;
    fetchTeamSummary(): void {
      this.dataService.getTeamSummary(this.statusId).subscribe({
        next: (data) => {
          this.totalAssignedAssets = data.totalAssignedAssets;
          this.teamSummary = data.teamAssets;
          console.log('Team Summary:', data);
        },
        error: (err) => console.error('Error fetching team summary', err)
      });
    }

    users: any = [];
    selectedTeam: any = 0;
    selectedTeamId: number = 0;
    selectedUserId: number = 0;
    selectedStatusId: number = 0;
    selectedCategoryId: number = 0;
    searchText: string = '';
    resetAssetsFilter(statusId: number): void {
      this.searchText='';
      this.selectedTeam = 0;
      this.selectedTeamId = 0;
      this.selectedUserId = 0;
      this.selectedStatusId = statusId;
      this.selectedCategoryId = 0;
      this.loadAssets();
    }
    getTeamMemberById(teamId: any): void {
      if(teamId==0){
        this.selectedTeamId = teamId;
        this.users = this.allUser;
        this.updateActiveFilters();
        return;
      }
      this.dataService.getTeamsById(teamId).subscribe((data) => {
        this.users = data.userList;
        this.selectedTeamId= data.id;
      });
      this.updateActiveFilters();
    }

    filterOption(input: string, option: any): boolean {
      return option.nzLabel.toLowerCase().includes(input.toLowerCase());
    }

    allUser: any = [];
    getOrganizationUserList(): void {
      this.dataService.getOrganizationUserList().subscribe(
        (response) => {
          this.allUser = response.listOfObject;
          this.users= this.allUser;
        },
        (error) => {
          console.error('Error fetching pending requests counter', error);
        }
      );
    }



    activeFilters: Filter[] = [];
    activeFilterTemp: Filter[] = [];
    updateActiveFilters(): void {
      this.activeFilters = [];

      if (this.selectedTeam !== 0) {
        const team = this.teamSummary.find((t: { teamUuid: any; }) => t.teamUuid === this.selectedTeam);
        const teamName = team ? team.teamName : 'Team';
        this.activeFilters.push({ type: 'team', label: `Team: ${teamName}`, value: this.selectedTeam });
      }
      if (this.selectedUserId !== 0) {
        const user = this.users.find((u: { id: number; }) => u.id === this.selectedUserId);
        const userName = user ? (user.userName || user.name) : 'User';
        this.activeFilters.push({ type: 'user', label: `User: ${userName}`, value: this.selectedUserId });
      }
      if (this.selectedStatusId !== 0) {
        const status = this.assetStatuses.find(s => s.id === this.selectedStatusId);
        const statusName = status ? status.name : 'Status';
        this.activeFilters.push({ type: 'status', label: `Status: ${statusName}`, value: this.selectedStatusId });
      }
      if (this.selectedCategoryId !== 0) {
        const category = this.categorySummary.find(c => c.categoryId === this.selectedCategoryId);
        const categoryName = category ? category.categoryName : 'Category';
        this.activeFilters.push({ type: 'category', label: `Category: ${categoryName}`, value: this.selectedCategoryId });
      }
    }

    // Remove an individual filter when its "x" is clicked
    removeFilters(filter: Filter): void {
      switch (filter.type) {
        case 'team':
          this.selectedTeam = 0;
          this.selectedTeamId = 0;
          // Reset users list to all users
          this.users = this.allUser;
          break;
        case 'user':
          this.selectedUserId = 0;
          break;
        case 'status':
          this.selectedStatusId = 0;
          break;
        case 'category':
          this.selectedCategoryId = 0;
          break;
      }
      // After removing a filter, update the pills and reload assets.
      this.updateActiveFilters();
      this.loadAssets();
    }

    statusChangeAssetId: number=0;
    statusChangeId: number=0;
    statusChangeDescription: string= '';
    statusChangeUserId: number=0;
    isUserEnable: boolean = false;
    changeStatusModal(assetId: number, statusId: number, userId: number, isUserEnable: boolean): void {
      this.statusChangeAssetId = assetId;
      this.statusChangeId = statusId;
      this.statusChangeUserId = userId;
      this.isUserEnable = isUserEnable;
    }

    statusChangeLoading: boolean = false;
    updateAssetStatus(): void {
      this.statusChangeLoading = true;
      this.dataService.changeStatus(this.statusChangeAssetId, this.statusChangeId, this.statusChangeDescription, this.statusChangeUserId)
        .subscribe({
          next: (response: any) => {
            this.statusChangeLoading = false;
            this.closeBtnDes.nativeElement.click();
            if (response.status) {
              this.loadAssets();
              console.log('Asset status updated successfully:', response.message);
            } else {
              console.error('Failed to update asset status:', response.message);
            }
          },
          error: (err) => {
            this.closeBtnDes.nativeElement.click();
            this.statusChangeLoading = false;
            console.error('Error updating asset status:', err);
          }
        });
    }
    @ViewChild('closeBtnDes') closeBtnDes!: ElementRef<HTMLButtonElement>;
    onCloseChangeStatusModal(): void {
      this.statusChangeAssetId = 0;
      this.statusChangeId = 0;
      this.statusChangeUserId = 0;
      this.statusChangeDescription = '';
      this.isUserEnable = false;
    }

    assetHistory: any;
    currentAsset: any;
    loadAssetHistory(asset: any): void {
      this.currentAsset = asset;
      this.dataService.getAssetHistory(asset.id).subscribe(
        (data:any) => {
          this.assetHistory = data;
        },
        (error) => {
          console.error('Error fetching asset history', error);
        }
      );
    }

  updateAsset(asset: any): void {
    this.assetData.id = asset.id;
    this.assetData.assetName = asset.assetName;
    this.assetData.serialNumber = asset.serialNumber;
    this.assetData.purchasedDate = asset.purchasedDate;
    this.assetData.expiryDate = asset.expiryDate;
    this.assetData.price = asset.price;
    this.assetData.location = asset.location;
    this.assetData.vendorName = asset.vendorName;

    this.assetData.userId = asset.assignedToId;
    this.assetData.assignedDate = null;
    this.assetData.categoryId = asset.assetCategoryId;
  }




  // Assets Requests
    assetRequestTab(): void {
      this.assetRequestsPage = 1;
      this.assetRequestsSearch = '';
      this.getAssetRequests();
      this.statusFilter = '';
      this.selectedFilters = new Set();
    }

    assetRequests: AssetRequestDTO[] = [];
    assetRequestsPage: number = 1;
    assetRequestsSize: number = 10;
    assetRequestsSearch: string = '';
    assetRequestsTotalPage: number=0;
    assetRequestsTotalCount: number=0;
    statusFilter: string='';
    Math = Math;
    isLoading = false;

    pageChangedRequest(page: number): void {
      this.assetRequestsPage = page;
      this.getAssetRequests();
    }

    getAssetRequests(): void {
      this.isLoading = true;
      this.dataService.getAssetRequests(this.assetRequestsPage, this.assetRequestsSize, this.assetRequestsSearch, [...this.selectedFilters]).subscribe(
        (response) => {
          this.assetRequests = response.data; // Assign only the data (array of AssetRequestDTO) from the response
          this.assetRequestsTotalPage=response.totalPages;
          this.assetRequestsTotalCount=response.totalItems;
          this.isLoading = false;
          this.selectedFiltersArray = Array.from(this.selectedFilters);
        },
        (error) => {
          this.isLoading = false;
          console.error('Error fetching asset requests:', error);
        }
      );
    }
    searchAssetsRequest(event: Event): void {
      this.assetRequestsSearch = (event.target as HTMLInputElement).value;
      this.getAssetRequests();

    }
    newStatus: string = 'Pending';
    selectedAsset: any;
    statuses: string[] = ['APPROVED', 'REJECTED'];
    openStatusChangeModal(asset: any, statusChangeModal: TemplateRef<any>) {
      this.selectedAsset = asset;
      if(asset.status == 'APPROVED'){
        this.openCreateAssetModal(asset);
        return;
      }
      this.modalService.open(statusChangeModal);
    }

    assetRequestStatusLoading: boolean = false;
    @ViewChild('assetRequestClose') assetRequestClose!: ElementRef<HTMLButtonElement>;
    changeStatus(asset: any) {
      this.assetRequestStatusLoading = true;
      asset.status = this.newStatus;
      this.modalService.dismissAll();
      this.dataService.changeAssetRequestStatus(asset.id, this.newStatus)
      .subscribe(
        (response) => {
          this.assetRequestClose.nativeElement.click();
          this.assetRequestStatusLoading = false;
          this.getAssetRequests();
          this.helperService.showToast(
            "Asset status change successfully",
            Key.TOAST_STATUS_SUCCESS
          );
        },
        (error) => {
          this.assetRequestStatusLoading = false;
          this.assetRequestClose.nativeElement.click();
          // Handle error response, e.g., show an error message
          this.getAssetRequests();
        }
      );
    }

    @ViewChild('createAssetButton', { static: false }) createAssetButton!: ElementRef;
    asset: any;
     openCreateAssetModal(asset: any) {
    //   debugger
    //   // Close any open modals first
    //   this.modalService.dismissAll();
    //   console.log(this.createAssetButton);
    //   if(this.createAssetButton){
    //   this.createAssetButton.nativeElement.click();
    //   this.selectedAsset = asset;
    //   this.allAssetCategoryData.forEach((category: any) => {
    //     if (category.categoryName === asset.assetCategoryName) {
    //     this.assetForm.patchValue({
    //       categoryId: category.categoryId
    //     });
    //   }
    //   });
    //   this.assetForm.patchValue({
    //     assetName: asset.assetName,
    //     userId: asset.userId,
    //   });
    //   this.asset = asset;
    //   }
     }

    downloadFlag: boolean=false;
    downloadExcel(): void {
      this.downloadFlag=true;
      this.dataService.downloadAssetRequests().subscribe(
        (blob) => {
          const a = document.createElement('a');
          const objectUrl = URL.createObjectURL(blob);
          a.href = objectUrl;
          a.download = 'asset_requests.xlsx';
          a.click();
          URL.revokeObjectURL(objectUrl);
          this.downloadFlag=false;
          // Show success message
          this.helperService.showToast('Download Successfully!',Key.TOAST_STATUS_SUCCESS );
        },
        (error) => {
          this.helperService.showToast('Download Failed!',Key.TOAST_STATUS_ERROR );
          this.downloadFlag=false;
        }
      );
    }

    pendingRequestsCounter: number = 0;
    getPendingRequestsCounter(): void {
      this.dataService.getPendingRequestsCounter().subscribe(
        (response) => {
          this.pendingRequestsCounter = response.pendingRequestsCounter;
        },
        (error) => {
          console.error('Error fetching pending requests counter', error);
        }
      );
    }


    selectedFilters: Set<string> = new Set();
  statusChange(event: any, status: string) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedFilters.add(status);
    } else {
      this.selectedFilters.delete(status);
    }
    console.log(this.selectedFilters);
  }

    isChecked(filter: string): boolean {
      return this.selectedFilters.has(filter);
    }


    selectedFiltersArray: string[] = [];
    removeFilter(status: string): void {
      this.selectedFilters.delete(status);
      this.selectedFiltersArray = Array.from(this.selectedFilters);
      this.assetRequestsPage = 1;
      this.getAssetRequests();
    }



    visible = false;
  childrenVisible = false;


  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

  openChildren(): void {
    this.childrenVisible = true;
  }

  closeChildren(): void {
    this.childrenVisible = false;
  }
}
