import { AssetService } from './../../../../services/asset.service';
import { ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormControl, NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Key } from 'src/app/constant/key';
import { AssetRequestDTO } from 'src/app/models/AssetRequestDTO';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexMarkers,
  ApexYAxis,
  ApexXAxis,
  ApexTooltip,
  ApexTitleSubtitle,
  ChartComponent,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexLegend
} from "ng-apexcharts";
import { constant } from 'src/app/constant/constant';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { Routes } from 'src/app/constant/Routes';
import { StatusKeys } from 'src/app/constant/StatusKeys';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  fill: ApexFill;
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
};
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

  constructor( private dataService : DataService,
    private assetService: AssetService,
    private helperService : HelperService,
     private modalService: NgbModal,
     private afStorage: AngularFireStorage,
     private cdr: ChangeDetectorRef,
     public rbacService: RoleBasedAccessControlService
    ) {  this.getMonthlyAssignmentsAssets();}
  showFilter: boolean = false;
  assetsList: boolean[] = [false];

  isEditing: boolean[] = [];
  loading: boolean[] = [];


  readonly Routes=Routes;
  readonly StatusKeys= StatusKeys;

  ngOnInit(): void {
    this.getPendingRequestsCounter();
    this.dashboard();
    this.getOrganizationUserList();
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchText: string) => {

      this.currentPage = 1;
      this.searchText=searchText;
      this.loadAssets();
    });
  }

    readonly Constants=constant;

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
    this.getAssetsChangePercentageList();
    // this.getMonthlyAssignmentsAssets();
    this.getRequestedTypeCount();
  }
  statusSummary: any[] = [];
  categorySummary: any[] = [];
  assetSummary: any[] = [];
  assetSummaryCategoryId: any = 0;
  // Separate method to fetch status summary
  fetchStatusSummary(): void {
    this.assetService.getStatusSummary().subscribe({
      next: (data) => {
        this.statusSummary = data;
      },
      error: (err) => console.error('Error fetching status summary', err)
    });
  }

  @ViewChild('closeButtonDeleteCategory') closeButtonDeleteCategory!: ElementRef<HTMLButtonElement>;
  deleteLoading: boolean = false;
  deleteCategory(id: number) {
    this.deleteLoading = true;
      this.assetService.deleteAssetCategory(id).subscribe({
        next: (response) => {
          this.deleteLoading = false;
          if (response.status) {
            this.isEditing = this.isEditing.map(() => false);
            this.closeButtonDeleteCategory.nativeElement.click();
            this.helperService.showToast('Category deleted successfully', Key.TOAST_STATUS_SUCCESS);
            this.dashboard();
          } else {
            this.helperService.showToast('Failed to delete category', Key.TOAST_STATUS_ERROR);
          }
        },
        error: (error) => {
          this.deleteLoading = false;
         this.helperService.showToast('Failed to delete category', Key.TOAST_STATUS_ERROR);
        }
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
    this.assetService.getCategorySummary().subscribe({
      next: (data) => {
        this.categorySummary = data;
        console.log('Category Summary:', data);
        if(this.categorySummary.length>0){
          this.assetSummaryCategoryId = this.categorySummary[0].categoryId;
          this.fetchAssetSummary();
          this.onSearch('');
        }
      },
      error: (err) => console.error('Error fetching category summary', err)
    });
  }

  fetchAssetSummary(): void {
    this.assetService.getAssetCategorySummary(this.assetSummaryCategoryId)
      .subscribe(
        (data) => {
          this.assetSummary = data;
        },
        (error) => {
          console.error('Error fetching asset summary:', error);
        }
      );
  }

  imagePreviewUrl: string | ArrayBuffer | null = null;
isFileUploaded: boolean = false;
selectedFile: File | null = null;
fileToUpload: string = '';
categoryId: number = 0;
selectedCategory: any = {};
updateCategoryFlag: boolean = false;
newCategory: any = {
  categoryName: '',
  categoryImage: ''
};
  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      this.isFileUploaded = true;
      this.selectedFile = fileList[0];

      if (this.selectedFile) {
        this.setImgPreviewUrl(this.selectedFile);
        this.uploadFile(this.selectedFile);
      }
    } else {
      this.isFileUploaded = false;
    }
  }

  assignCategoryId(category: any, index: number = 0) {
    this.isEditing = this.isEditing.map((value, i) => (i === index ? value : false));
    this.selectedCategory = category;
    this.categoryId = category.categoryId;
    if(this.categoryId!=0) {
      this.newCategory = { categoryName: category.categoryName, categoryImage: '' };
    } else {
      this.newCategory = { categoryName: '', categoryImage: '' };
    }
  }

  getAssetCategoryDataById(): void {
    this.dataService.getAssetCategoryById(this.categoryId)
      .subscribe(
        (response) => {
          if (response && response.object) {
            const categoryData = response.object;
            this.newCategory = {
              categoryName: categoryData.categoryName,
              categoryImage: categoryData.categoryImage
            };
            this.imagePreviewUrl = categoryData.categoryImage;
            this.cdr.detectChanges();
          }
        },
        (error) => {
          console.error('Error fetching asset category data by id:', error);
        }
      );
    }

    isCategoryUpdateLoading: boolean = false;
  saveOrUpdateCategory(index:number = 0) {
    this.isCategoryUpdateLoading = true;
    if(this.categoryId!=0) {
      this.updateCategory(index);
    } else {
      this.saveCategory();
    }
  }
  setImgPreviewUrl(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreviewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  uploadFile(file: File): void {
    const filePath = `uploads/${new Date().getTime()}_${file.name}`;
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
            // console.log('File URL:', url);
            this.fileToUpload = url;
            this.isFileUploaded = false;
          })
          .catch((error) => {
            this.isFileUploaded = false;
            console.error('Failed to get download URL', error);
          });
      })
      .catch((error) => {
        this.isFileUploaded = false;
        console.error('Error in upload snapshotChanges:', error);
      });
  }


  @ViewChild('closeUpdateCategory') closeUpdateCategory!: ElementRef<HTMLButtonElement>;
  updateCategory(index: number): void {
    this.loading[index] = true;
    if (this.fileToUpload) {
      this.newCategory.categoryImage = this.fileToUpload;
    }
    this.assetService.updateAssetCategory(this.categoryId, this.newCategory)
      .subscribe(
        response => {
          this.isCategoryUpdateLoading = false;
          this.loading[index] = false;
          this.isEditing[index] = false;
          if(response.status){
            this.closeUpdateCategory.nativeElement.click();
            this.helperService.showToast('Asset category updated successfully', Key.TOAST_STATUS_SUCCESS);
          }else{
            this.helperService.showToast('Asset category update failed', Key.TOAST_STATUS_ERROR);
          }
          this.fetchCategorySummary();
          document.getElementById('createCategoryModal')?.click();
          this.imagePreviewUrl = null;
        },
        error => {
          this.isCategoryUpdateLoading = false;
          this.loading[index] = false;
          console.error('Error updating asset category:', error);
        }
      );
  }

  // @ViewChild("closeCreateCategoryModal") closeCreateCategoryModal!:ElementRef;
  saveCategory(): void {
    if (this.fileToUpload) {
      this.newCategory.categoryImage = this.fileToUpload;
    }
    this.assetService.createAssetCategory(this.newCategory)
      .subscribe(
        response => {
          if(response.status){
            this.helperService.showToast('Asset category created successfully', Key.TOAST_STATUS_SUCCESS);
          }else{
            this.helperService.showToast('Asset category creation failed', Key.TOAST_STATUS_ERROR);
          }

          this.isCategoryUpdateLoading = false;
          this.fetchCategorySummary();
          document.getElementById('createCategoryModal')?.click();
          this.newCategory = { categoryName: '', categoryImage: '' };
          this.imagePreviewUrl = null;
        },
        error => {
          this.isCategoryUpdateLoading = false;
          console.error('Error creating asset category:', error);
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
    categoryId: null,
    categoryName: ''
  };

  assetCreateLoading: boolean = false;
  @ViewChild('closeBtn') closeBtn!: ElementRef<HTMLButtonElement>;
  onSubmit(form: NgForm): void {
    this.assetCreateLoading=true;
    if (form.valid) {
      this.assetService.createAssets(this.assetData).subscribe(
        (response: any) => {
          this.assetCreateLoading=false;
          if (response.status) {
            this.closeBtn.nativeElement.click();
            this.fetchCategorySummary();
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
    this.assetData.id=0;
    Object.values(form.controls).forEach(control => {
      control.markAsUntouched();
    });
  }

  disableFutureDates = (current: Date): boolean => {
    return current > new Date(); // Disables dates after today
  };

  // Add these variables in your component
  searchCategoryText: string = '';
showNewCategoryInput: boolean = false;
filteredCategories: any[] = [];
showCreateOption: boolean = false;
onSearch(searchText: string): void {
  searchText = searchText.trim();
  this.searchCategoryText = searchText;
  if(searchText && searchText.length!=0){
    this.assetData.categoryName = searchText;
  }
  this.filteredCategories = this.categorySummary.filter(c =>
    c.categoryName.toLowerCase().includes(searchText.toLowerCase())
  );

  // Check if search text doesn't exactly match any existing category
  const exactMatch = this.categorySummary.some(c =>
    c.categoryName.toLowerCase() === searchText.toLowerCase()
  );
  this.showCreateOption = !!searchText && !exactMatch;
}







  // assigned assets

  assignedAssets(): void {
    this.resetAssetsFilter(0);
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
      this.changeShowFilter(false);
      this.isAssetLoading = true;
      this.assetService.getFilteredAssets(this.selectedTeamId, this.selectedUserId, this.selectedStatusId, this.selectedCategoryId, this.searchText, this.currentPage-1, this.pageSize)
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
      this.assetService.getTeamSummary(this.statusId).subscribe({
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
      this.changeShowFilter(false);
      this.currentPage = 1;

      this.searchControl.setValue('');
      this.searchText='';
      this.selectedTeam = 0;
      this.selectedTeamId = 0;
      this.selectedUserId = 0;
      this.selectedStatusId = statusId;
      this.selectedCategoryId = 0;
      this.activeFilters = [];
      this.activeFilterTemp = [];
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
      this.assetService.getOrganizationUserList().subscribe(
        (response) => {
          this.allUser = response.listOfObject;
          this.users= this.allUser;
        },
        (error) => {
          console.error('Error fetching pending requests counter', error);
        }
      );
    }

    assetsChangePercentage: any = [];
    getAssetsChangePercentageList(): void {
      this.assetService.getAssetChangePercentageList().subscribe(
        (response) => {
          this.assetsChangePercentage = response;
        },
        (error) => {
          console.error('Error fetching pending requests counter', error);
        }
      );
    }

    checkPercentageChange(statusId: number): { isPositive: boolean, percentageChange: number } {
      const found = this.assetsChangePercentage.find((item: { statusId: number; }) => item.statusId === statusId);
      return found ? { isPositive: found.percentageChange > 0, percentageChange: Math.abs(found.percentageChange) } : { isPositive: false, percentageChange: 0 };
    }
    assetsMonthlyAssignments : any = [];
    getMonthlyAssignmentsAssets(): void {
      this.assetService.getMonthlyAssignments(62).subscribe(
        (response) => {
          this.assetsMonthlyAssignments = response;
          this.initChartData();
        },
        (error) => {
          console.error('Error fetching pending requests counter', error);
        }
      );
    }
    getCurrentMonthStats(): { currentMonthCount: number, percentageChange: number } {
      const currentDate = new Date();
      const currentMonthYear = currentDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });

      const currentMonthData = this.assetsMonthlyAssignments.find((entry: { monthYear: string; }) => entry.monthYear === currentMonthYear);
      const lastMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
      const lastMonthYear = lastMonthDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });

      const lastMonthData = this.assetsMonthlyAssignments.find((entry: { monthYear: string; }) => entry.monthYear === lastMonthYear);

      const currentMonthCount = currentMonthData ? currentMonthData.assignmentCount : 0;
      const lastMonthCount = lastMonthData ? lastMonthData.assignmentCount : 0;

      let percentageChange = 0;
      if (lastMonthCount > 0) {
          percentageChange = ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100;
      } else if (currentMonthCount > 0) {
          percentageChange = 100; // If last month had 0 assignments and this month has some, consider it a full increase
      }

      return { currentMonthCount, percentageChange };
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
    statusChangeCurrentUserId: number=0;
    isUserEnable: boolean = false;
    changeStatusModal(assetId: number, statusId: number, userId: number, isUserEnable: boolean): void {
      this.statusChangeAssetId = assetId;
      this.statusChangeId = statusId;
      this.statusChangeCurrentUserId = userId;
      this.isUserEnable = isUserEnable;
    }

    statusChangeLoading: boolean = false;
    isUserSame(): boolean {
      if (this.isUserEnable) {
        if(this.statusChangeUserId==0 || this.statusChangeUserId==this.statusChangeCurrentUserId){
          return true;
        }
        else{
          return false;
        }
      }else{
        return false;
      }
    }
    updateAssetStatus(): void {
      if (this.isUserEnable) {
       if(this.statusChangeUserId==0 || this.statusChangeUserId==this.statusChangeCurrentUserId){
         return;
       }
      }
      this.statusChangeLoading = true;
      this.assetService.changeStatus(this.statusChangeAssetId, this.statusChangeId, this.statusChangeDescription, this.statusChangeUserId)
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
      this.assetService.getAssetHistory(asset.id).subscribe(
        (data:any) => {
          this.assetHistory = data;
        },
        (error) => {
          console.error('Error fetching asset history', error);
        }
      );
    }

    capitalizeWords(input: any): string {
      if (typeof input !== 'string') {
        return '';
      }
      return input
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
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
      this.selectedFilters = new Set<string>(['Pending']);
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
      this.changeShowFilter(false);
      this.isLoading = true;
      this.assetService.getAssetRequests(this.assetRequestsPage, this.assetRequestsSize, this.assetRequestsSearch, [...this.selectedFilters]).subscribe(
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
      this.assetRequestsPage = 1;
      this.getAssetRequests();

    }

    assetModalData:any = {};
    isAssetRequestModalOpen: boolean = false;
    onAssetRequestOpen(asset: any): void {
      this.assetModalData ={isModal:true, asset:asset};
      this.isAssetRequestModalOpen = true;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }

    onAssetComponentClose(): void {
      this.assetModalData={};
      this.assetRequestTab();
      this.isAssetRequestModalOpen = false;
      this.assetRequestClose.nativeElement.click();
      console.log('Asset request tab closed');
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
      this.modalService.dismissAll();
      this.assetService.changeAssetRequestStatus(asset.id, this.newStatus)
      .subscribe(
        (response) => {
          asset.status = this.newStatus;
          this.onViewRequest(asset);
          if(this.newStatus != 'APPROVED'){
            this.assetRequestClose.nativeElement.click();
          }
          this.assetRequestStatusLoading = false;
          this.getAssetRequests();
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
            this.getAssetRequests();
            return;
          }
          this.onViewRequest(asset);
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
      this.assetService.downloadAssetRequests().subscribe(
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
      this.assetService.getPendingRequestsCounter().subscribe(
        (response) => {
          this.pendingRequestsCounter = response.pendingRequestsCounter;
        },
        (error) => {
          console.error('Error fetching pending requests counter', error);
        }
      );
    }


    requestedTypeCount: any = {};
    getRequestedTypeCount(): void {
      this.assetService.getRequestedTypeCount().subscribe(
        (response) => {
          this.requestedTypeCount = response;
          this.initializeDonutChart();
        },
        (error) => {
          console.error('Error fetching pending requests counter', error);
        }
      );
    }

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
        }, error => {
          this.availableAssetLoading = false;
        }
      );
    }


  selectAsset(index: number) {
    this.assetsBooleanList = new Array(this.assetsAvailable.length).fill(false);
    this.assetsBooleanList[index] = true;
    this.selectedAvailableAsset = this.assetsAvailable[index];
  }
    onViewRequest(asset: any): void {
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
            this.getAssetRequests();
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


    selectedFilters: Set<string> = new Set<string>(['Pending']);
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
  changeShowFilter(flag : boolean) {
    this.showFilter = flag;
  }


  public series: ApexAxisChartSeries = [];
  public chart: ApexChart  = {
    type: "area",
    stacked: false,
    height: 200,
    background: "transparent",
    zoom: {
      enabled: false // 🔹 Disables zooming
    },
    toolbar: {
      show: false,
      tools: {
        zoomin: false,  // Keep zoom in enabled
        zoomout: false, // 🔹 Disable zoom out button
        pan: false,
        reset: false // Optionally disable reset zoom
      }
    },
  };
  public grid = {
    show: false // 🔹 Hide grid lines
  };

  public dataLabels: ApexDataLabels = { enabled: false };
  public markers: ApexMarkers = { size: 5 };
  public title: ApexTitleSubtitle = { text: "Monthly Asset Assignments" };
  public fill: ApexFill = { type: "gradient", gradient: { shadeIntensity: 10, inverseColors: false, opacityFrom: 0.5, opacityTo: 0, stops: [0, 90, 100] } };
  public yaxis: ApexYAxis = {  labels: { show: false } };
  public xaxis: ApexXAxis = {
    type: "datetime",
    labels: {
      format: "MMM", // Show short month names (e.g., "Feb")
      rotate: -45,   // Rotate labels to prevent overlap
      hideOverlappingLabels: false, // Force all labels to show
    },
    tickPlacement: "on",
    min: undefined, // Will be set dynamically
    max: undefined,  // Will include 2 extra months
  };

  public tooltip: ApexTooltip = { x: { format: "MMM yyyy" } };
  isChartInitialized: boolean = false;
  public initChartData(): void {
    if (!this.assetsMonthlyAssignments || this.assetsMonthlyAssignments.length === 0) {
      console.warn("No data available for the chart.");
      return;
    }

    const dates = this.assetsMonthlyAssignments.map((item: { monthYear: string; }) =>
      this.convertToDate(item.monthYear)
    );

    if (dates.length === 0 || dates.some(isNaN)) {
      console.error("Invalid dates in assetsMonthlyAssignments", dates);
      return;
    }

    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);

    const lastDate = new Date(maxDate);
    const extendedMaxDate = new Date(
      Date.UTC(lastDate.getUTCFullYear(), lastDate.getUTCMonth() + 1, 1)
    );

    this.xaxis = {
      ...this.xaxis,
      min: minDate,
      max: extendedMaxDate.getTime(),
    };

    this.series = [
      {
        name: "Asset Assignments",
        data: this.assetsMonthlyAssignments.map((item: { monthYear: string; assignmentCount: any; }) => ({
          x: this.convertToDate(item.monthYear),
          y: item.assignmentCount,
        })),
      },
    ];

    setTimeout(() => {
      this.cdr.markForCheck();
    this.cdr.detectChanges();
      this.isChartInitialized = true;
    }, 500);
  }



  private convertToDate(monthYear: string): number {
    if (!monthYear) {
      console.error("Invalid monthYear input:", monthYear);
      return NaN;
    }

    const monthMap: { [key: string]: number } = {
      "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
      "Jul": 6, "Aug": 7, "Sep": 8, "Sept": 8, "Oct": 9, "Nov": 10, "Dec": 11
    };


    const [month, year] = monthYear.split(" ");
    if (!month || !year || !monthMap.hasOwnProperty(month)) {
      console.error("Invalid month format:", monthYear);
      return NaN;
    }

    return Date.UTC(parseInt(year), monthMap[month], 1);
  }



  @ViewChild("chart") chart1: ChartComponent | undefined;

    public chartOptions: Partial<ChartOptions> | any = {
      series: [0, 0, 0, 0, 0],
      chart: {
        width: "100%",
        type: "donut"
      },
      colors: this.getDynamicColors(this.requestedTypeCount),
      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 90,
          expandOnClick: false,
          offsetY: 0, // Prevents segments from expanding
          donut: {
            labels: {
              show: false // Hide labels inside the donut
            },
            innerWidth: "90%",
            outerWidth: "32%"
          }
        }
      },
      // Hide data labels
      dataLabels: {
        enabled: false
      },
      // Hide grid lines (optional)
      grid: {
        show: false,
        padding: {
          bottom: -80
        },
        stroke: {
          width: 2, // Adjust this value as needed
          colors: "#000"
        }
      },
      // Hide the legend
      legend: {
        show: false
      },
      // Hide tooltip (optional)
      tooltip: {
        enabled: true
      }
    };
  isChartLoaded: boolean = false;
  initializeDonutChart() {
    this.chartOptions = {
      series: Object.values(this.requestedTypeCount),
      chart: {
        width: 180,
        type: "donut"
      },
      colors: this.getDynamicColors(this.requestedTypeCount),

      labels: Object.keys(this.requestedTypeCount).map(key => this.labelMapping[key] || key),
      dataLabels: {
        enabled: false
      },
      fill: {
        type: "gradient"
      },
      legend: {
        show: false // Hide the legend
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 100
            },
            legend: {
              position: "bottom"
            },
            tooltip: {
              enabled: true,
              y: {
                formatter: (value: number, { seriesIndex, w }: any) => {
                  // Show the renamed labels in tooltip
                  return `${w.config.labels[seriesIndex]}: ${value}`;
                }
              }
            }
          }
        }
      ]
    };
    this.isChartLoaded = true;
  }

  public labelMapping: { [key: string]: string } = {
    "NewAssetAllocation": "New Request",
    "AssetReplacement": "Replacement Requests",
    "RepairRequest": "Repair Requests"
  };
  public getDynamicColors(data: { [key: string]: number }): string[] {
    return Object.keys(data).map(key => {
      if (key === "NewAssetAllocation") return "#CA365F";
      if (key === "AssetReplacement") return "#F3A73D";
      if (key === "RepairRequest") return "#47539F";
      return "#999999"; // Default color
    });
  }


  visible2: boolean = false; // Open drawer by default

  close2(): void {
    this.isEditing = this.isEditing.map(() => false);
    this.visible2 = false; // Close the drawer
  }

  openDrawer(): void {
    this.visible2 = true; // Function to open drawer again
  }
  }



