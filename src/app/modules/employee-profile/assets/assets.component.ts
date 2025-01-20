import { DataService } from 'src/app/services/data.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OrganizationAssetResponse } from 'src/app/models/asset-category-respose';
import { ActivatedRoute } from '@angular/router';
import { AssetRequestDTO } from 'src/app/models/AssetRequestDTO';
import { UserDTO } from 'src/app/models/UserDTO';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Key } from 'src/app/constant/key';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

interface AssetCategory {
  value: string;
  label: string;
}

interface User {
  value: string;
  label: string;
}

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.css']
})
export class AssetsComponent implements OnInit {
  assetRequestForm!: FormGroup;
  assetCategories: { value: number, label: string }[] = [];
  assetNames: AssetCategory[] = [];
  users: User[] = [];
  private searchSubject: Subject<string> = new Subject<string>();
  private assetSearchSubject: Subject<string> = new Subject<string>();
  userId : any;
  currentUserId: any;
  contentTemplate: string = "tool tip";
  constructor(private activateRoute: ActivatedRoute, private dataService: DataService,
    private fb: FormBuilder,private modalService: NgbModal, private helper: HelperService,
    public rbacService: RoleBasedAccessControlService,)
  {
    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }
    this.currentUserId = this.rbacService.getUuid();
    this.searchSubject.pipe(
      debounceTime(1000)
    ).subscribe((searchText) => {
      this.assetRequestsSearch = searchText;
      this.getAssetRequests();
    });
    this.assetSearchSubject.pipe(
      debounceTime(1000)
    ).subscribe((searchText) => {
      this.search = searchText;
      this.crossFlag = this.search.length > 0;
      this.pageNumber = 1;
      this.getAssetData();
    });
  }

  ngOnInit(): void {
    this.getAssetData();
    this.fetchManagerNames();
    this.loadAssetCategories();

    this.assetRequestForm = this.fb.group({
      requestType: ['Asset Replacement', Validators.required],
      assetCategory: [null, Validators.required],
      assetName: [null, Validators.required],
      requestedUser: [null, Validators.required],
      note: ['', [Validators.maxLength(200)]]
    });



  }

  loadAssetCategories(): void {
    this.dataService.getAssetCategory().subscribe(response => {
      this.assetCategories = response.listOfObject.map((item: any) => ({
        value: item.categoryId,
        label: item.categoryName
      }));
    }, error => {
      console.error('Error fetching asset categories:', error);
      this.assetCategories = []; // Set to empty array if there's an error
    });
  }

  isLoadingForm: boolean = false;
  @ViewChild('closeButton') closeButton: any;
  @ViewChild('assetRequestTab', { static: true }) assetRequestTab!: ElementRef;
  submitForm(modal: any): void {
    if (this.isLoadingForm) {
      return;
    }
    this.isLoadingForm = true;

    if (this.assetRequestForm.valid) {
      const formData = {...this.assetRequestForm.value,userId: this.userId};
      // this.closeButton.nativeElement.click();
      this.dataService.createAssetRequest(formData).subscribe(
        response => {
          this.assetRequestsPage=1;
          this.getAssetRequests();
          this.assetRequestForm.reset({
            requestType: 'Asset Replacement',
            assetCategory: null,
            assetName: null,
            requestedUser: null,
            note: ''
          });
          this.isLoadingForm = false;
          this.closeButton.nativeElement.click();
          this.helper.showToast(
            "Asset request submitted successfully",
            Key.TOAST_STATUS_SUCCESS
          );
          this.assetRequestTab.nativeElement.click();
        },
        error => {
          console.error('Error submitting asset request:', error);
        }
      );
    } else {
      console.log('Form is invalid');
    }
  }

  managers: UserDTO[] = [];
  selectedManagerId!: number;

  fetchManagerNames() {
    this.dataService.getEmployeeManagerDetails(this.userId).subscribe(
      (data: UserDTO[]) => {
        this.managers = data;
      },
      (error) => {

      }
    );
  }


  assets: OrganizationAssetResponse[] = [];

  search: string = '';
  pageNumber: number = 1;
  itemPerPage: number = 6;
  assetData: OrganizationAssetResponse[] = [];
  totalCount: number = 0;
  crossFlag: boolean = false;
  isLoadingAsset: boolean = false;
  getAssetData(): void {
    this.isLoadingAsset=true;
    this.dataService.getAssetForUser(this.userId, this.search, this.pageNumber, this.itemPerPage)
      .subscribe(
        (response) => {
          this.assets = response.object;
          this.totalCount = response.totalItems;
          this.isLoadingAsset=false;
        },
        (error) => {
          console.error('Error fetching asset data:', error);
          this.isLoadingAsset=false;
        }
      );
  }
  isAssetsArrayEmpty(): boolean {
    if(this.search?.length>0){
      return false;
    }
    return !this.assets || this.assets.length === 0;
  }
  searchAssets(event: Event): void {
    this.assetSearchSubject.next((event.target as HTMLInputElement).value);
  }
  pageChanged(page: number): void {
    this.pageNumber = page;  // Update current page when changed
    this.getAssetData();      // Fetch data for the new page
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
    this.assetRequestsPage = page;  // Update current page when changed
    this.getAssetRequests();      // Fetch data for the new page
  }

  isAssetRequestArrayEmpty(): boolean {
    if(this.assetRequestsSearch?.length>0 || this.statusFilter.length>0){
      return false;
    }
    return !this.assetRequests || this.assetRequests.length === 0;
  }

  getAssetRequests(): void {
    this.isLoading=true;
    this.dataService.getAssetRequestsByUserUuid(this.userId, this.assetRequestsPage, this.assetRequestsSize, this.assetRequestsSearch, this.statusFilter).subscribe(
      (response) => {
        this.assetRequests = response.data; // Assign only the data (array of AssetRequestDTO) from the response
        this.assetRequestsTotalPage=response.totalPages;
        this.assetRequestsTotalCount=response.totalItems;
        this.isLoading=false;
      },
      (error) => {
        console.error('Error fetching asset requests:', error);
      }
    );
  }

  onSearchInput(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(inputValue);
  }

  resetSearch() {
    this.searchSubject.next('');
  }


}
