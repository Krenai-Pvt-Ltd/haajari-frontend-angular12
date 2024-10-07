import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Key } from 'src/app/constant/key';
import { AllocateCoinsRoleWiseRequest, AllocateCoinsRoleWiseResponse, AllocateCoinsToBadgeRequest, CoinsForBadgesResponse, RemainingBadgesResponse, RolesForSuperCoinsResponse } from 'src/app/models/allocate-coins-role-wise-request';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-coins',
  templateUrl: './coins.component.html',
  styleUrls: ['./coins.component.css']
})
export class CoinsComponent implements OnInit {

  allocateCoinsForm: FormGroup;
  allocateCoinsForBadgesForm!: FormGroup;
  constructor(private fb: FormBuilder, private dataService:DataService, private cdr: ChangeDetectorRef, private afStorage: AngularFireStorage, private helperService:HelperService) { 
    this.allocateCoinsForm = this.fb.group({
      allocatedCoins: ['', Validators.required],
      donateLimitForManager: [''],
      donateLimitForUser: [''],
      donateLimitForTeamMates: [''],
      roleId: ['', Validators.required]
    });

    this.allocateCoinsForBadgesForm = this.fb.group({
      badgeName: [null, Validators.required],
      badgeLogo: [null, Validators.required],
      assignedMinCoins: [null, Validators.required],
      assignedMaxCoins: [null, Validators.required]
    });

  }

  ngOnInit(): void {
    this.getRolesData();
    this.loadRoleWiseAllocatedCoins();
    // this.getBadgesData();
    this.getBadgeCoinsInfoData();
    // this.helperService.saveOrgSecondaryToDoStepBarData(0);
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
          // console.log("assigned successfully")
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
    // console.log("Deleted successfully", response);
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

// badges: RemainingBadgesResponse[] = [];
// getBadgesData() {
//   this.dataService.getRemainingBadges().subscribe(
//     data => {
//       this.badges = data.listOfObject;
//     },
//     error => {
//       console.error("Error fetching roles", error);
//     }
//   );
// }

// allocateCoinstoBadgeId:number = 0;
// @ViewChild("closeSuperCoinsForBadgesModal") closeSuperCoinsForBadgesModal!:ElementRef
// onSubmitBadges(): void {
//   if (this.allocateCoinsForBadgesForm.valid) {
//     const allocateCoinsToBadgeRequest: AllocateCoinsToBadgeRequest = this.allocateCoinsForBadgesForm.value;
//     this.dataService.allocateCoinsForBadgeOrganizationWise(allocateCoinsToBadgeRequest, this.allocateCoinstoBadgeId).subscribe(
//       (response) => {
//         console.log('Coins allocated successfully:', response);
//         this.closeSuperCoinsForBadgesModal.nativeElement.click();
//         this.getBadgeCoinsInfoData();
//         this.getBadgesData();
//         this.allocateCoinsForBadgesForm.reset();
//       },
//       (error) => {
//         console.error('Error allocating coins:', error);
//       }
//     );
//   }
// }

allocateCoinstoBadgeId: number = 0;
imagePreviewUrl: string | null = null;
selectedFile: File | null = null;
fileToUpload: string | null = null;
errorString: string = '';

@ViewChild("closeSuperCoinsForBadgesModal") closeSuperCoinsForBadgesModal!: ElementRef;

onSubmitBadges(): void {

  if (this.allocateCoinsForBadgesForm.valid) {
    this.allocateCoinsForBadgesForm.get('badgeName')?.enable();
    const allocateCoinsToBadgeRequest: AllocateCoinsToBadgeRequest = this.allocateCoinsForBadgesForm.value;
    if(this.fileToUpload) {
    allocateCoinsToBadgeRequest.badgeLogo = this.fileToUpload;
    }

    this.dataService.allocateCoinsForBadgeOrganizationWise(allocateCoinsToBadgeRequest, this.allocateCoinstoBadgeId).subscribe(
      (response) => {
        console.log('Coins allocated successfully:', response);
        this.closeSuperCoinsForBadgesModal.nativeElement.click();
        this.getBadgeCoinsInfoData();
        // this.getBadgesData();
        this.allocateCoinsForBadgesForm.reset();
        this.imagePreviewUrl = null; // Reset image preview
      },
      (error) => {
        console.error('Error allocating coins:', error);
        if(error.error.message === 'Badge Name Already Existed') {
          this.errorString = 'Badge Name Already Existed! ';
          this.helperService.showToast('Badge Name Already Existed', Key.TOAST_STATUS_ERROR);
        }
      }
    );
  }
}

onFileSelected(event: Event): void {
  const element = event.currentTarget as HTMLInputElement;
  const fileList: FileList | null = element.files;

  if (fileList && fileList.length > 0) {
    this.selectedFile = fileList[0];

    if (this.selectedFile) {
      this.setImgPreviewUrl(this.selectedFile);
      this.uploadFile(this.selectedFile);
    }
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
          this.allocateCoinsForBadgesForm.get('badgeLogo')?.setValue(url);
        })
        .catch((error) => {
          console.error('Failed to get download URL', error);
        });
    })
    .catch((error) => {
      console.error('Error in upload snapshotChanges:', error);
    });
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
    this.errorString = '';
    this.allocateCoinstoBadgeId = allocatedCoinsToBadgeId;

    if (this.allocateCoinstoBadgeId > 0) {
      this.allocateCoinsForBadgesForm.get('badgeName')?.disable();
    } else {
      this.allocateCoinsForBadgesForm.get('badgeName')?.enable();
    }
    this.dataService.getBadgeCoinsInformationById(allocatedCoinsToBadgeId).subscribe(data => {
        if (data && data.listOfObject && data.listOfObject.length > 0) {
            const badgeInfo = data.listOfObject[0];

            this.allocateCoinsForBadgesForm.patchValue({
                badgeLogo: badgeInfo.badgeLogo, 
                badgeName: badgeInfo.badgeName,
                assignedMinCoins: badgeInfo.assignedMinCoins,
                assignedMaxCoins: badgeInfo.assignedMaxCoins
            });

            this.imagePreviewUrl = badgeInfo.badgeLogo;

            this.cdr.detectChanges();
        }
    },
    error => {
        console.error("Error fetching roles", error);
    });
}

  resetAllocateCoinsForBadgesForm() {
    this.allocateCoinsForBadgesForm.get('badgeName')?.enable();
    this.imagePreviewUrl = '';
    this.errorString = '';
    this.allocateCoinstoBadgeId = 0;
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
