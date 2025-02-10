import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Key } from 'src/app/constant/key';
import { AssetRequestDTO } from 'src/app/models/AssetRequestDTO';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

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
  }

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
      this.dataService.getFilteredAssets(undefined, undefined, undefined, undefined, '', this.currentPage-1, this.pageSize)
        .subscribe(response => {
          this.isAssetLoading = false;
          this.assets = response.content; // Assuming `content` holds the paginated data
          this.totalItems = response.totalElements; // Extract total pages from response
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

    teamSummary: any;
    statusId: number = 62;
    fetchTeamSummary(): void {
      this.dataService.getTeamSummary(this.statusId).subscribe({
        next: (data) => {
          this.teamSummary = data;
          console.log('Team Summary:', data);
        },
        error: (err) => console.error('Error fetching team summary', err)
      });
    }

  team: any = [];
    getTeamMemberById(teamId: any): void {
      this.dataService.getTeamsById(teamId).subscribe((data) => {
        this.team = data;
      });
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

    changeStatus(asset: any) {
      this.asset=null;
      asset.status = this.newStatus;
      this.modalService.dismissAll();
      this.dataService.changeAssetRequestStatus(asset.id, this.newStatus)
      .subscribe(
        (response) => {
          this.getAssetRequests();
          this.helperService.showToast(
            "Asset status change successfully",
            Key.TOAST_STATUS_SUCCESS
          );
        },
        (error) => {
          console.error('Error updating status:', error);
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

}
