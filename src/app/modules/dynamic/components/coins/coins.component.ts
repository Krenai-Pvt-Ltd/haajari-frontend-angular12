import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AllocateCoinsRoleWiseRequest, AllocateCoinsRoleWiseResponse, AllocateCoinsToBadgeRequest, CoinsForBadgesResponse, RemainingBadgesResponse, RolesForSuperCoinsResponse } from 'src/app/models/allocate-coins-role-wise-request';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-coins',
  templateUrl: './coins.component.html',
  styleUrls: ['./coins.component.css']
})
export class CoinsComponent implements OnInit {

  allocateCoinsForm: FormGroup;
  allocateCoinsForBadgesForm!: FormGroup;
  constructor(private fb: FormBuilder, private dataService:DataService, private cdr: ChangeDetectorRef) { 
    this.allocateCoinsForm = this.fb.group({
      allocatedCoins: ['', Validators.required],
      donateLimitForManager: [''],
      donateLimitForUser: [''],
      donateLimitForTeamMates: [''],
      roleId: ['', Validators.required]
    });

    this.allocateCoinsForBadgesForm = this.fb.group({
      badgeId: [null, Validators.required],
      assignedMinCoins: [null, Validators.required],
      assignedMaxCoins: [null, Validators.required]
    });

  }

  ngOnInit(): void {
    this.getRolesData();
    this.loadRoleWiseAllocatedCoins();
    this.getBadgesData();
    this.getBadgeCoinsInfoData();
  }

  roles: RolesForSuperCoinsResponse[] = [];
  getRolesData() {
    this.dataService.getRoles().subscribe(
      data => {
        this.roles = data.listOfObject;
      },
      error => {
        console.error("Error fetching roles", error);
      }
    );
  }

  @ViewChild("closeEditModal") closeEditModal!:ElementRef;
  onSubmit() {
    debugger
    if (this.allocateCoinsForm.valid) {
      const request: AllocateCoinsRoleWiseRequest = this.allocateCoinsForm.value;
      this.dataService.allocateCoinsRoleAndOrganizationWise(request).subscribe(
        response => {
          console.log("assigned successfully")
          this.closeEditModal.nativeElement.click();
          this.loadRoleWiseAllocatedCoins();
          this.allocateCoinsForm.reset();
        },
        error => {
          console.error("Error allocating coins", error);
        }
      );
    }
  }

  roleWiseCoins: AllocateCoinsRoleWiseResponse[] = [];
  loadRoleWiseAllocatedCoins(): void {
    this.dataService.getRoleWiseAllocatedCoins().subscribe(data => {
      this.roleWiseCoins = data.listOfObject;
    },
    error => {
      console.error("Error fetching roles", error);
    });
  }

  loadRoleWiseAllocatedCoinsById(allocateSuperCoinsId: number): void {
    this.dataService.getRoleWiseAllocatedCoinsInformationById(allocateSuperCoinsId).subscribe(data => {
        if (data && data.listOfObject && data.listOfObject.length > 0) {
            const coinsInfo = data.listOfObject[0];

            this.allocateCoinsForm.patchValue({
                roleId: coinsInfo.roleId, 
                allocatedCoins: coinsInfo.allocatedCoins,
                donateLimitForManager: coinsInfo.donateLimitForManager,
                donateLimitForUser: coinsInfo.donateLimitForUser,
                donateLimitForTeamMates: coinsInfo.donateLimitForTeamMates
            });

            this.cdr.detectChanges();
        }
    },
    error => {
        console.error("Error fetching roles", error);
    });
}
allocateSuperCoinsId:number=0;
deleteByIdFlag: boolean = false;

openDeleteConfirmationModal(roleSuperCoinsId:number, flag: boolean) {
 this.allocateSuperCoinsId = roleSuperCoinsId;
 this.deleteByIdFlag = flag;
}

callDelete() {
  if(this.deleteByIdFlag === true && this.allocateSuperCoinsId>0) {
    this.deleteRoleWiseAllocatedCoinsInformationById();
    this.deleteByIdFlag = false;
  } else if (this.deleteByIdFlag === false && this.allocateSuperCoinsId>0){
      this.deleteBadgeCoinsAllocationInfoById();
      this.deleteByIdFlag = false;
  }
}
disableLoader:boolean= false;
@ViewChild("closeUserDeleteModal") closeUserDeleteModal!:ElementRef;
deleteRoleWiseAllocatedCoinsInformationById() {
  this.disableLoader = true;
this.dataService.deleteRoleWiseAllocatedCoinsInformationById(this.allocateSuperCoinsId).subscribe(
  response => {
    console.log("Deleted successfully", response);
    this.disableLoader = false;
    this.closeUserDeleteModal.nativeElement.click();
    this.loadRoleWiseAllocatedCoins();
  },
  error => {
    this.disableLoader = false;
    console.error("Error deleting coins", error);
  }
);
}

resetRoleSuperCoinsAllocationForm() {
  this.allocateCoinsForm.reset();
}

badges: RemainingBadgesResponse[] = [];
getBadgesData() {
  this.dataService.getRemainingBadges().subscribe(
    data => {
      this.badges = data.listOfObject;
    },
    error => {
      console.error("Error fetching roles", error);
    }
  );
}

@ViewChild("closeSuperCoinsForBadgesModal") closeSuperCoinsForBadgesModal!:ElementRef
onSubmitBadges(): void {
  if (this.allocateCoinsForBadgesForm.valid) {
    const allocateCoinsToBadgeRequest: AllocateCoinsToBadgeRequest = this.allocateCoinsForBadgesForm.value;
    this.dataService.allocateCoinsForBadgeOrganizationWise(allocateCoinsToBadgeRequest).subscribe(
      (response) => {
        console.log('Coins allocated successfully:', response);
        this.closeSuperCoinsForBadgesModal.nativeElement.click();
        this.getBadgeCoinsInfoData();
        this.getBadgesData();
        this.allocateCoinsForBadgesForm.reset();
      },
      (error) => {
        console.error('Error allocating coins:', error);
      }
    );
  }
}

coinsForBadges: CoinsForBadgesResponse[] = [];

getBadgeCoinsInfoData(): void {
    this.dataService.getBadgeCoinsInfo().subscribe(data => {
      this.coinsForBadges = data.listOfObject;
    },
    error => {
      console.error("Error fetching roles", error);
    });
  }


  getBadgeCoinsInformationByIdData(allocatedCoinsToBadgeId: number): void {
    this.dataService.getBadgeCoinsInformationById(allocatedCoinsToBadgeId).subscribe(data => {
        if (data && data.listOfObject && data.listOfObject.length > 0) {
            const badgeInfo = data.listOfObject[0];

            this.allocateCoinsForBadgesForm.patchValue({
                badgeId: badgeInfo.badgeId, 
                assignedMinCoins: badgeInfo.assignedMinCoins,
                assignedMaxCoins: badgeInfo.assignedMaxCoins
            });

            this.cdr.detectChanges();
        }
    },
    error => {
        console.error("Error fetching roles", error);
    });
}

  resetAllocateCoinsForBadgesForm() {
  this.allocateCoinsForBadgesForm.reset();
  }


  deleteBadgeCoinsAllocationInfoById() {
  this.disableLoader = true;
  this.dataService.deleteBadgeCoinsAllocationInfoById(this.allocateSuperCoinsId).subscribe(
    response => {
      console.log("Deleted successfully", response);
      this.disableLoader = false;
      this.closeUserDeleteModal.nativeElement.click();
      this.getBadgeCoinsInfoData();

    },
    error => {
      this.disableLoader = false;
      console.error("Error deleting coins", error);
    }
  );
  }

  
  






  

}
