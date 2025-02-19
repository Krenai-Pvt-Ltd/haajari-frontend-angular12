import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { AssetService } from 'src/app/services/asset.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-asset-request',
  templateUrl: './asset-request.component.html',
  styleUrls: ['./asset-request.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetRequestComponent implements OnInit {

  @Input() data: any;
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
  constructor(
    private assetService: AssetService,
    private helperService: HelperService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.onViewRequest(this.data.asset);
  }

    newStatus: string = 'Pending';
      selectedAsset: any;
      statuses: string[] = ['APPROVED', 'REJECTED'];

      assetsAvailable: any = [];
    totalPages: number = 0;
    currentRequestPage: number = 1;
    pageRequestSize: number = 12;
    totalRequestAssets: number = 0;
    searchQuery: string = '';
    assetCategoryId: number = 0;
    assetsBooleanList: boolean[] = [false];
    selectedAvailableAsset: any;
    availableAssetLoading: boolean = false;
    fetchRequestedAssetsAvailable(): void {
      this.availableAssetLoading = true;
      this.assetService.getRequestedAvailableAssets(this.assetCategoryId, this.searchQuery, (this.currentRequestPage-1), this.pageRequestSize)
        .subscribe(response => {
          this.availableAssetLoading = false;
          this.assetsAvailable = response.content;
          this.totalPages = response.totalPages;
          this.totalRequestAssets = response.totalElements;
          console.log(this.assetsAvailable);
          this.cdr.detectChanges();
          this.cdr.markForCheck();
        }, error => {
          this.availableAssetLoading = false;
        }
      );
    }

    close() {
      this.closeModal.emit();
    }

      onViewRequest(asset: any): void {
        console.log(asset);
        this.selectedAsset = asset;
        if(asset.status == 'APPROVED'){
          this.selectedAvailableAsset = null;
          this.totalPages=0;
          this.currentRequestPage=1;
          this.searchQuery=asset.assetName;
          this.assetCategoryId=asset.assetCategory;
          this.pageRequestSize = 12;
          this.fetchRequestedAssetsAvailable();
        }

      }

       selectAsset(index: number) {
          this.assetsBooleanList = new Array(this.assetsAvailable.length).fill(false);
          this.assetsBooleanList[index] = true;
          this.selectedAvailableAsset = this.assetsAvailable[index];
        }

          assetAssignedLoading: boolean = false;
          @ViewChild('assetAssignClose') assetAssignClose!: ElementRef<HTMLButtonElement>;
          assignAsset(): void {
            this.assetAssignedLoading = true;
            this.assetService.assignRequestedAsset(this.selectedAvailableAsset.id, this.selectedAsset.id).subscribe(
              (response) => {
                this.assetAssignedLoading = false;
                this.selectedAvailableAsset = null;
                if (response.status) {
                  this.assetAssignClose.nativeElement.click();
                  this.helperService.showToast('Asset assigned successfully', Key.TOAST_STATUS_SUCCESS);
                } else {
                  this.helperService.showToast('Failed to assign asset', Key.TOAST_STATUS_ERROR);
                }
              },
              (error) => {
                this.assetAssignedLoading = false;
                this.helperService.showToast('Failed to assign asset', Key.TOAST_STATUS_ERROR);
              }
            );
          }

    assetRequestStatusLoading: boolean = false;
    @ViewChild('assetRequestClose') assetRequestClose!: ElementRef<HTMLButtonElement>;
    changeStatus(asset: any) {
      this.assetRequestStatusLoading = true;
      this.assetService.changeAssetRequestStatus(asset.id, this.newStatus)
      .subscribe(
        (response) => {
          asset.status = this.newStatus;
          this.onViewRequest(asset);
          if(this.newStatus != 'APPROVED'){
            this.assetRequestClose.nativeElement.click();
          }
          this.assetRequestStatusLoading = false;
          this.helperService.showToast(
            "Asset status change successfully",
            Key.TOAST_STATUS_SUCCESS
          );
        },
        (error) => {
          asset.status = this.newStatus;
          this.assetRequestStatusLoading = false;
          if(this.newStatus != 'APPROVED'){
            this.assetRequestClose.nativeElement.click();
            this.helperService.showToast(
              "Asset status change successfully",
              Key.TOAST_STATUS_SUCCESS
            );
            return;
          }
          this.onViewRequest(asset);
          // Handle error response, e.g., show an error message
        }
      );
    }
}
