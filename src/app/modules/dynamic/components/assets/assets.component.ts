import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';
import * as moment from 'moment';
import { Key } from 'src/app/constant/key';
import { AssetCategoryRequest, AssetCategoryResponse, OrganizationAssetRequest, OrganizationAssetResponse, StatusWiseTotalAssetsResponse } from 'src/app/models/asset-category-respose';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.css']
})
export class AssetsComponent implements OnInit {

  assetForm: FormGroup;
  assignRejectForm: FormGroup;
  constructor(private cdr: ChangeDetectorRef, private fb: FormBuilder, private dataService : DataService, private afStorage: AngularFireStorage, private domSanitizer: DomSanitizer, private helperService : HelperService) { 
    this.assetForm = this.fb.group({
      assetName: ['', Validators.required],
      serialNumber: ['', Validators.required],
      purchasedDate: [null, Validators.required],
      expiryDate: [null],
      price: ['', Validators.required],
      location: ['', Validators.required],
      vendorName: [''],
      userId: [null],
      assignedDate: [null],
      categoryId: [null, Validators.required]
    });

    this.assignRejectForm = this.fb.group({
      userId: [null, Validators.required],
      assignedDate: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.getAssetCategoryData();
    this.getTotalAssetData();
    this.getAssetData();
    this.getAllAssetCategoryData();
    this.getAssetUserListData();
    this.getCategoryCounts();
    this.getAssetDataById();
    // this.helperService.saveOrgSecondaryToDoStepBarData(0);
  }

  assetCategoryData: AssetCategoryResponse[] = [];
  getAssetCategoryData(): void {
    this.dataService.getAssetCategory()
      .subscribe(
        (response) => {
          this.assetCategoryData = response.listOfObject;
        },
        (error) => {
          console.error('Error fetching asset category data:', error);
        }
      );
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
  
  totalAssetData: any;
  getTotalAssetData(): void {
    this.dataService.getTotalAsset()
      .subscribe(
        (response) => {
          this.totalAssetData = response.listOfObject[0];
        },
        (error) => {
          console.error('Error fetching total asset data:', error);
        }
      );
  }


  search: string = '';
  pageNumber: number = 1;
  itemPerPage: number = 8;
  assetData: OrganizationAssetResponse[] = [];
  totalCount: number = 0;
  crossFlag: boolean = false;
  getAssetData(): void {
    this.dataService.getAsset(this.search, this.pageNumber, this.itemPerPage)
      .subscribe(
        (response) => {
          this.assetData = response.object;
          this.totalCount = response.totalItems;
        },
        (error) => {
          console.error('Error fetching asset data:', error);
        }
      );
  }

  assetIdToUpdate:number = 0;
  getAssetDataById(): void {
    this.dataService.getAssetById(this.assetIdToUpdate)
      .subscribe(
        (response) => {
          const assetData = response.object;
          this.assetForm.patchValue({
            assetName: assetData.assetName,
            serialNumber: assetData.serialNumber,
            purchasedDate: new Date(assetData.purchasedDate), 
            expiryDate: assetData.expiryDate ? new Date(assetData.expiryDate) : null,
            price: assetData.price,
            location: assetData.location,
            vendorName: assetData.vendorName,
            userId: assetData.userId,
            assignedDate: assetData.assignedDate ? new Date(assetData.assignedDate) : null,
            categoryId: assetData.categoryId
          });
  
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error fetching asset data by id:', error);
        }
      );
  }

  searchAssets(): void {
    this.crossFlag = this.search.length > 0;
    this.pageNumber = 1;
    this.getAssetData();
  }

  clearSearch(): void {
    this.crossFlag = false;
    this.search = '';
    this.pageNumber = 1;
    this.getAssetData();
  }

  changePage(page: number | string): void {
    if (typeof page === 'string') {
      if (page === 'prev' && this.pageNumber > 1) {
        this.pageNumber--;
      } else if (page === 'next' && this.pageNumber < Math.ceil(this.totalCount / this.itemPerPage)) {
        this.pageNumber++;
      }
    } else {
      this.pageNumber = page;
    }
    this.getAssetData();
  }

  totalPages(): number {
    return Math.ceil(this.totalCount / this.itemPerPage);
  }

  get startIndex(): number {
    return Math.min((this.pageNumber - 1) * this.itemPerPage + 1, this.totalCount);
  }

  get endIndex(): number {
    return Math.min(this.pageNumber * this.itemPerPage, this.totalCount);
  }

  get pages(): number[] {
    const totalPages = Math.ceil(this.totalCount / this.itemPerPage);
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

//  save category 

newCategory: AssetCategoryRequest = {
  categoryName: '',
  categoryImage: '' 
};

imagePreviewUrl: string | ArrayBuffer | null = null; 
isFileUploaded: boolean = false;
selectedFile: File | null = null;
fileToUpload: string = '';
categoryId: number = 0;
updateCategoryFlag: boolean = false;

assignCategoryId(categoryId: number) {
  this.categoryId = categoryId;
  if(categoryId!=0) {
    this.getAssetCategoryDataById();
  } else {
    this.newCategory = { categoryName: '', categoryImage: '' };
  }
}
saveOrUpdateCategory() {
  if(this.categoryId!=0) {
    this.updateCategory();
  } else {
    this.saveCategory();
  }
}

updateCategory(): void {
  if (this.fileToUpload) {
    this.newCategory.categoryImage = this.fileToUpload;
  }
  this.dataService.updateAssetCategory(this.categoryId, this.newCategory)
    .subscribe(
      response => {
        // console.log('Asset category updated successfully:', response);
        this.getAssetCategoryData();
        document.getElementById('createCategoryModal')?.click();
        this.newCategory = { categoryName: '', categoryImage: '' };
        this.imagePreviewUrl = null;
        this.getAllAssetCategoryData();
      },
      error => {
        console.error('Error updating asset category:', error);
      }
    );
}

// @ViewChild("closeCreateCategoryModal") closeCreateCategoryModal!:ElementRef;
saveCategory(): void {
  if (this.fileToUpload) {
    this.newCategory.categoryImage = this.fileToUpload; 
  }
  this.dataService.createAssetCategory(this.newCategory)
    .subscribe(
      response => {
        // console.log('Asset category created successfully:', response);
        this.getAssetCategoryData();
        document.getElementById('createCategoryModal')?.click();
        this.newCategory = { categoryName: '', categoryImage: '' };
        this.imagePreviewUrl = null;
        this.getAllAssetCategoryData();
        // this.getCategoryCounts();
      },
      error => {
        console.error('Error creating asset category:', error);
      }
    );
}

setImgPreviewUrl(file: File): void {
  const reader = new FileReader();
  reader.onload = (e: any) => {
    this.imagePreviewUrl = e.target.result;
  };
  reader.readAsDataURL(file);
}

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
  
//  create asset 

allAssetCategoryData: any;
getAllAssetCategoryData(): void {
  this.dataService.getAllAssetCategory()
    .subscribe(
      (response) => {
        this.allAssetCategoryData = response.listOfObject || [];
      },
      (error) => {
        console.error('Error fetching full asset category data:', error);
      }
    );
}

allAssetUserListData: any;
getAssetUserListData(): void {
  this.dataService.getAssetUserList()
    .subscribe(
      (response) => {
        this.allAssetUserListData = response.listOfObject || [];
      },
      (error) => {
        console.error('Error fetching full asset category data:', error);
      }
    );
}



 assignAssetId(assetId: number) {
  this.assetIdToUpdate = assetId;
  if(assetId>0) {
    this.getAssetDataById();
  } else {
    this.assetForm.reset();
  }
}

updateOrSaveAsset() {
  if(this.assetIdToUpdate > 0) {
   this.updateAsset();
  } else {
    this.saveAsset();
  }
}

@ViewChild('closeCreateAssetModal') closeCreateAssetModal!:ElementRef;

updateAsset(): void {
  this.dataService.editAsset(this.assetIdToUpdate, this.assetForm.value)
    .subscribe(
      response => {
        this.assetForm.reset();
        this.getAssetData();
        this.getAssetCategoryData();
        this.getTotalAssetData();
        this.getCategoryCounts();
        document.getElementById('createAssetModal')?.click();
        this.closeCreateAssetModal.nativeElement.click();
        this.helperService.showToast('Asset updated successfully.', Key.TOAST_STATUS_SUCCESS);
      },
      error => {
        if(error.error.message == 'Serial Number Already Registered') {
          this.helperService.showToast('Serial Number Already Registered With Other Asset.', Key.TOAST_STATUS_ERROR);
        } else {
        this.helperService.showToast('Failed to update asset.', Key.TOAST_STATUS_ERROR);
        }
      }
    );
}


saveAsset(): void {
  if (this.assetForm.invalid) {
    console.log('Please fill out all required fields.');
    this.helperService.showToast("Please fill out all required fields.", Key.TOAST_STATUS_ERROR);
    return;
  }

  const newAsset = this.assetForm.value;

  this.dataService.createAsset(newAsset).subscribe(
    (response) => {
     
        // console.log('Asset created successfully.');
        this.assetForm.reset();
        this.getAssetData();
        this.getAssetCategoryData();
        this.getTotalAssetData();
        this.getCategoryCounts();
        this.closeCreateAssetModal.nativeElement.click();
        document.getElementById('createAssetModal')?.click();
        this.helperService.showToast('Asset created successfully.', Key.TOAST_STATUS_SUCCESS);
     
    },
    (error) => {
      // console.error('Error creating asset:', error);
      // console.log('Failed to create asset. Please try again.');
      if(error.error.message == 'Serial Number Already Registered') {
        this.helperService.showToast('Serial Number Already Registered.', Key.TOAST_STATUS_ERROR);
      } else {
      this.helperService.showToast('Failed to create asset.', Key.TOAST_STATUS_ERROR);
      }
    }
  );
}

disabledDate = (current: Date): boolean => {
  return moment(current).isAfter(moment(), 'day');
}

// status wise assets 

totalAssetsStatusWiseData: StatusWiseTotalAssetsResponse[] = [];
  totalCountSystem: number = 0;
  searchTermSystem: string = '';
  filterString: string = '';
  pageNumberSystem: number = 1; 
  itemPerPageSystem: number = 10; 
  totalPagesSystem: number = 0; 
  startIndexSystem: number = 0; 
  endIndexSystem: number = 0; 
  currentPageSystem: number = 1;
  pagesSystem: number[] = []; 
  systemModalString: string = 'Total Assets';

  getTotalAssetsStatusWiseData(filString: string): void {
    this.filterString = filString;
    if(filString== 'ALL') {
      this.systemModalString = 'Total Assets'
    } else if(filString== 'ASSIGNED') {
      this.systemModalString = 'Total Assigned Assets'
    } else if(filString== 'AVAILABLE') {
      this.systemModalString = 'Total Available Assets'
    } else if(filString== 'UNAVAILABLE') {
      this.systemModalString = 'Total Unavailable Assets'
    }
    this.dataService
      .getTotalAssetsStatusWise(
        this.filterString,
        this.searchTermSystem,
        this.pageNumberSystem,
        this.itemPerPageSystem
      )
      .subscribe(
        (response) => {
          this.totalAssetsStatusWiseData = response.object;
          this.totalCountSystem = response.totalItems;
          this.calculatePagination();
        },
        (error) => {
          console.error('Error fetching asset data:', error);
        }
      );
  }

  calculatePagination(): void {
    this.totalPagesSystem = Math.ceil(this.totalCountSystem / this.itemPerPageSystem);
    this.startIndexSystem = (this.currentPageSystem - 1) * this.itemPerPageSystem + 1;
    this.endIndexSystem = Math.min(this.currentPageSystem * this.itemPerPageSystem, this.totalCountSystem);
    this.pagesSystem = [];
    for (let i = 1; i <= this.totalPagesSystem; i++) {
      this.pagesSystem.push(i);
    }
  }

  changePageSystem(page: number | 'prev' | 'next'): void {
    if (page === 'prev') {
      this.currentPageSystem--;
    } else if (page === 'next') {
      this.currentPageSystem++;
    } else {
      this.currentPageSystem = page;
    }
    this.getTotalAssetsStatusWiseData( this.filterString);
  }

  searchSystem(): void {
    this.getTotalAssetsStatusWiseData( this.filterString); 
  }

  reloadPageSystem(): void {
    this.searchTermSystem = '';
    this.getTotalAssetsStatusWiseData( this.filterString);
  }

  //  assignOrReturn 

  modalHeadString : string = '';
  modalSelectUserString : string = '';
  modalDateString : string = '';
  selectedAssetId : number = 0;
  stringToSaveData: string = '';
  assignOrRejectModalStrings(statusString : string, selectedAssetId: number) {
    this.selectedAssetId = selectedAssetId;
    if(statusString == 'ASSIGNED') {
      this.modalHeadString = 'Return Asset';
      this.modalSelectUserString = 'Select User To Return Asset By';
      this.modalDateString = 'Return Date';
      this.stringToSaveData = 'RETURNEDBY';
    } else if (statusString == 'AVAILABLE') {
      this.modalHeadString = 'Assign Asset';
      this.modalSelectUserString = 'Select User To Assign Asset';
      this.modalDateString = 'Assign Date';
      this.stringToSaveData = 'ASSIGNEDTO';
    } else if (statusString == 'UNAVAILABLE') {
      this.modalHeadString = 'Assign Asset';
      this.modalSelectUserString = 'Select User To Assign Asset';
      this.modalDateString = 'Assign Date';
      this.stringToSaveData = 'ASSIGNEDTO';
    }
  }

  makeAssetUnavailable(str: string , assetId: number) {
    // this.selectedAssetId  = assetId;
    // this.stringToSaveData = str;
    this.dataService.assignOrReturnAsset( assetId, str,this.assignRejectForm.value).subscribe(
      (response) => {
          this.getAssetData();
          this.getAssetCategoryData();
          this.getTotalAssetData();
          this.helperService.showToast('Operation Executed Successfully.', Key.TOAST_STATUS_SUCCESS);
      
      },
      (error) => {
        this.helperService.showToast('Failed', Key.TOAST_STATUS_ERROR);
      }
    )
  }
  // assignOrReturnAsset

  submitAssignRejectForm(): void {
    if (this.assignRejectForm.valid) {
      this.dataService.assignOrReturnAsset( this.selectedAssetId, this.stringToSaveData ,this.assignRejectForm.value).subscribe(
        (response) => {
            this.assignRejectForm.reset();
            this.getAssetData();
            this.getAssetCategoryData();
            this.getTotalAssetData();
            document.getElementById('assignRejectModal')?.click();
            this.helperService.showToast('Operation Executed Successfully.', Key.TOAST_STATUS_SUCCESS);
        
        },
        (error) => {
          this.helperService.showToast('Failed', Key.TOAST_STATUS_ERROR);
        }
      );
          
    } else {
      this.assignRejectForm.markAllAsTouched();
    }
  }

  //  chart 

categoryCounts: any[] = [];
// colorScheme: any = {
//   domain: ['#80CBC4', '#FFE082', '#80CBC4', '#FFCCBC', '#9575CD', '#4FC3F7', '#AED581', '#FFD54F', '#FF7043']
// };

colorScheme: Color = {
  name: 'custom',
  selectable: true,
  group: ScaleType.Ordinal, 
  domain: ['#80CBC4', '#FFE082', '#80CBC4', '#FFCCBC', '#9575CD', '#4FC3F7', '#AED581', '#FFD54F', '#FF7043']
};
view: [number, number] = [600, 340];

getCategoryCounts(): void {
  debugger
  this.dataService.getCategoryCounts()
    .subscribe(
      (response: any) => {
        this.categoryCounts = this.formatDataForChart(response.listOfObject);
      },
      (error: any) => {
        console.error('Error fetching category counts:', error);
      }
    );
}

private formatDataForChart(data: any[]): any[] {
  return data.map((item) => ({
    name: item.category_name, 
    series: [{
      name: 'Count',
      value: item.category_count 
    }]
  }));
}


  // categoryCounts: any[] = [];
  // colorScheme: any = {
  //   domain: ['#FFE082', '#80CBC4', '#FFCCBC', '#9575CD', '#4FC3F7', '#AED581', '#FFD54F', '#FF7043']
  // };
  // // legendPosition: LegendPosition = LegendPosition.Below; 
  // view: [number, number] = [600, 340]; 
  // getCategoryCounts(): void {
  //   this.dataService.getCategoryCounts() 
  //     .subscribe(
  //       (response: any) => {
  //         this.categoryCounts = this.formatDataForChart(response.listOfObject);
  //       },
  //       (error: any) => {
  //         console.error('Error fetching category counts:', error);
  //       }
  //     );
  // }

  // private getMonthName(monthNumber: string): string {
  //   const monthNames = [
  //     'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  //     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  //   ];
  //   return monthNames[parseInt(monthNumber, 10) - 1];
  // }
  

  // private formatDataForChart(data: any[]): any[] {
  //   return data.map((item) => {
      
  //     const [year, monthNumber] = item.month.split('-');
  //     const monthName = this.getMonthName(monthNumber);
  
  //     const series = item.category_array.map((category: any) => ({
  //       name: category.category_name,
  //       value: category.category_count
  //     }));
  
  //     return {
  //       name: `${monthName}`, 
  //       series: series
  //     };
  //   });
  // }
  

  //  delete asset 
 assetId : number = 0;
 disableLoader : boolean = false;
 @ViewChild("closeUserDeleteModal") closeUserDeleteModal!:ElementRef;
  openDeleteAssetModal(assetId: number) {
    this.assetId = assetId;
  }

  deleteAssetData(): void {
    this.disableLoader = true;
    this.dataService.deleteAsset(this.assetId) 
      .subscribe(
        (response: any) => {
          this.helperService.showToast('Asset Deleted Successfully.', Key.TOAST_STATUS_SUCCESS);
          this.disableLoader = false;
          this.getAssetData();
          this.getAssetCategoryData();
          this.getTotalAssetData();
          this.closeUserDeleteModal.nativeElement.click();
        },
        (error: any) => {
          this.helperService.showToast('Error in Deletion.', Key.TOAST_STATUS_ERROR);
          this.disableLoader = false;
        }
      );
  }


  

  
}
