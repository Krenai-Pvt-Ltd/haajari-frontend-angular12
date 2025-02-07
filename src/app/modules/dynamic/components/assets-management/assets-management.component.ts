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
  }



  // Assets Requests


    assetRequests: AssetRequestDTO[] = [];
    assetRequestsPage: number = 1;
    assetRequestsSize: number = 10;
    assetRequestsSearch: string = '';

    assetRequestsTotalPage: number=0;
    assetRequestsTotalCount: number=0;
    statusFilter: string='';
    Math = Math;
    isLoading = true;

    filterStatus(status: string): void {
      this.statusFilter = status;
      this.assetRequestsPage=1;
      this.getAssetRequests();
    }

    pageChangedRequest(page: number): void {
      this.assetRequestsPage = page;
      this.getAssetRequests();
    }
    isAssetRequestArrayEmpty(): boolean {
      if(this.assetRequestsSearch?.length>0 || this.statusFilter.length>0){
        return false;
      }
      return !this.assetRequests || this.assetRequests.length === 0;
    }

    getAssetRequests(): void {
      this.isLoading = true;
      this.dataService.getAssetRequests(this.assetRequestsPage, this.assetRequestsSize, this.assetRequestsSearch, this.statusFilter).subscribe(
        (response) => {
          this.assetRequests = response.data; // Assign only the data (array of AssetRequestDTO) from the response
          this.assetRequestsTotalPage=response.totalPages;
          this.assetRequestsTotalCount=response.totalItems;
          this.isLoading = false;
          console.log('Asset requests:', this.isAssetRequestArrayEmpty());
          console.log('Total items:', response.totalItems);
          console.log('Current page:', response.currentPage);
          console.log('Total pages:', response.totalPages);
        },
        (error) => {
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
