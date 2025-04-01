import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { Routes } from 'src/app/constant/Routes';
import { StatusKeys } from 'src/app/constant/StatusKeys';
import { AssetService } from 'src/app/services/asset.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-asset-request',
  templateUrl: './asset-request.component.html',
  styleUrls: ['./asset-request.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetRequestComponent implements OnInit {

  /**
   * Variable declaration start
   */
  @Input() data: any;
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
  isModal: boolean = true;
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
  /**
   * Variable declaration end
   */

  readonly Routes=Routes;
  readonly StatusKeys= StatusKeys;

  constructor(
    private assetService: AssetService,
    private helperService: HelperService,
    private cdr: ChangeDetectorRef,
    public rbacService: RoleBasedAccessControlService
  ) { }


  ngOnInit(): void {
    this.onViewRequest(this.data.asset);
    if (this.data.isModal == 0) {
      this.isModal = false;
    }

  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.onViewRequest(this.data.asset);
      if (this.data.isModal == 0) {
        this.isModal = false;
      }
    }
  }

  fetchRequestedAssetsAvailable(): void {
    this.availableAssetLoading = true;
    this.assetService.getRequestedAvailableAssets(this.assetCategoryId, this.searchQuery, (this.currentRequestPage - 1), this.pageRequestSize)
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
    if (asset.status == 'APPROVED') {
      this.selectedAvailableAsset = null;
      this.totalPages = 0;
      this.currentRequestPage = 1;
      this.searchQuery = asset.assetName;
      this.assetCategoryId = asset.assetCategory;
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
          if (this.isModal) {
            this.assetAssignClose.nativeElement.click();
          }
          this.helperService.showToast('Asset assigned successfully', Key.TOAST_STATUS_SUCCESS);
          this.selectedAsset.status = 'ASSIGNED';
          this.cdr.detectChanges();
          this.cdr.markForCheck();
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
          if(response.status){
          asset.status = this.newStatus;
          this.onViewRequest(asset);
          if (this.newStatus != 'APPROVED' && this.isModal) {
            this.closeModal.emit();
          }
          this.assetRequestStatusLoading = false;
          this.helperService.showToast(
            "Asset status change successfully",
            Key.TOAST_STATUS_SUCCESS
          );
        }
        },
        (error) => {
          this.assetRequestStatusLoading = false;
          this.helperService.showToast(
            "Failed to change asset status",
            Key.TOAST_STATUS_ERROR
          );
        }
      );
  }
}
