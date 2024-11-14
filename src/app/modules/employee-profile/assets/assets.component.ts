import { DataService } from 'src/app/services/data.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { OrganizationAssetResponse } from 'src/app/models/asset-category-respose';
import { ActivatedRoute } from '@angular/router';
import { AssetRequestDTO } from 'src/app/models/AssetRequestDTO';
import { UserDTO } from 'src/app/models/UserDTO';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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

  userId : any;
  constructor(private activateRoute: ActivatedRoute, private dataService: DataService,
    private fb: FormBuilder,private modalService: NgbModal)
  {
    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }
  }

  ngOnInit(): void {
    this.getAssetData();
    this.getAssetRequests();
    this.fetchManagerNames();
    this.loadAssetCategories();

    this.assetRequestForm = this.fb.group({
      requestType: ['Asset Replacement', Validators.required],
      assetCategory: [null, Validators.required],
      assetName: [null, Validators.required],
      requestedUser: [null, Validators.required],
      note: ['']
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

  @ViewChild('closeButton') closeButton: any;
  submitForm(modal: any): void {
    if (this.assetRequestForm.valid) {
      const formData = {...this.assetRequestForm.value,userId: this.userId};
      this.closeButton.nativeElement.click();
      this.dataService.createAssetRequest(formData).subscribe(
        response => {
          this.getAssetRequests();
          console.log('Asset request submitted successfully:', response);
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
  getAssetData(): void {
    this.dataService.getAssetForUser(this.userId, this.search, this.pageNumber, this.itemPerPage)
      .subscribe(
        (response) => {
          this.assets = response.object;
          this.totalCount = response.totalItems;
        },
        (error) => {
          console.error('Error fetching asset data:', error);
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
    this.search = (event.target as HTMLInputElement).value;  // Extract value from the input field
    this.crossFlag = this.search.length > 0;
    this.pageNumber = 1;
    this.getAssetData();
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
  assetRequestsPage: number = 0;
  assetRequestsSize: number = 10;
  assetRequestsSearch: string = '';

  isAssetRequestArrayEmpty(): boolean {
    if(this.assetRequestsSearch?.length>0){
      return false;
    }
    return !this.assetRequests || this.assetRequests.length === 0;
  }

  getAssetRequests(): void {

    this.dataService.getAssetRequestsByUserUuid(this.userId, this.assetRequestsPage, this.assetRequestsSize, this.assetRequestsSearch).subscribe(
      (response) => {
        this.assetRequests = response.data; // Assign only the data (array of AssetRequestDTO) from the response

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


}
