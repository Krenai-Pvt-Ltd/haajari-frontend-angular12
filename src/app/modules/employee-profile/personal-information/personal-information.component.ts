import { Status } from './../../../models/status';
import { saveAs } from 'file-saver';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { OnboardingFormPreviewResponse } from 'src/app/models/onboarding-form-preview-response';
import { UserAcademicsDetailRequest } from 'src/app/models/user-academics-detail-request';
import { UserAddressDetailsRequest } from 'src/app/models/user-address-details-request';
import { UserAddressRequest } from 'src/app/models/user-address-request';
import { UserEmergencyContactDetailsRequest } from 'src/app/models/user-emergency-contact-details-request';
import { UserExperience } from 'src/app/models/user-experience';
import { UserExperienceDetailRequest } from 'src/app/models/user-experience-detail-request';
import { UserGuarantorRequest } from 'src/app/models/user-guarantor-request';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.css']
})
export class PersonalInformationComponent implements OnInit {

  profileEdit: boolean = false;
  userId: any;

  constructor(private dataService: DataService,private activateRoute: ActivatedRoute, private helperService : HelperService,
    public rbacService: RoleBasedAccessControlService,
  ) {
    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }
  }

  ngOnInit(): void {
    this.getOnboardingFormPreviewMethodCall();
    this.loadRoutes();
    this.getPendingRequest();

  }

  user: any = {};
  isImage: boolean = false;

  // getUserByUuid() {
  //   this.dataService.getUserByUuid(this.userId).subscribe(
  //     (data) => {
  //       this.user = data;

  //       if (constant.EMPTY_STRINGS.includes(this.user.image)) {
  //         this.isImage = false;
  //       } else {
  //         this.isImage = true;
  //       }
  //     },
  //     (error) => {
  //       this.isImage = false;
  //     }
  //   );
  // }

  addressEmployee: any[] = [];
  // getEmployeeAdressDetailsByUuid() {
  //   // this.isAddressShimmer=true;
  //   this.dataService.getNewUserAddressDetails(this.userId).subscribe(
  //     (data: UserAddressDetailsRequest) => {
  //         this.addressEmployee = data.userAddressRequest;
  //     },
  //     (error) => {

  //     }
  //   );
  // }

  academicEmployee: any;
  isAcademicPlaceholder: boolean = false;

  // getEmployeeAcademicDetailsByUuid() {
  //   this.dataService.getEmployeeAcademicDetails(this.userId).subscribe(
  //     (data) => {
  //       if (data != null || data != undefined) {
  //         this.academicEmployee = data;
  //       } else {
  //         this.isAcademicPlaceholder = true;
  //       }
  //     },
  //     (error) => {
  //       this.isAcademicPlaceholder = true;
  //     }
  //   );
  // }

  isFresher: boolean = false;
  experienceEmployee: any;
  isCompanyPlaceholder: boolean = false;
  // getEmployeeExperiencesDetailsByUuid() {
  //   this.dataService.getEmployeeExperiencesDetails(this.userId).subscribe(
  //     (data: UserExperienceDetailRequest) => {
  //       this.experienceEmployee = data;

  //       if (this.experienceEmployee[0].fresher == true) {
  //         this.isFresher = this.experienceEmployee[0].fresher;
  //       }
  //       // console.log('experience length' + this.experienceEmployee.length);
  //       if (data == undefined || data == null || data.experiences?.length == 0) {
  //         this.isCompanyPlaceholder = true;
  //       }
  //     },
  //     (error) => {
  //       this.isCompanyPlaceholder = true;
  //     }
  //   );
  // }

  emergencyContacts: any;
  isContactPlaceholder: boolean = false;
  // getEmergencyContactsDetailsByUuid() {
  //   this.dataService.getEmployeeContactsDetails(this.userId).subscribe(
  //     (data) => {
  //       this.emergencyContacts = data;
  //       if (data == null || data.length == 0) {
  //         this.isContactPlaceholder = true;
  //       }
  //     },
  //     (error) => {
  //       this.isContactPlaceholder = true;
  //     }
  //   );
  // }

  bankDetailsEmployee: any;
  isBankShimmer: boolean = false;
  // getEmployeeBankDetailsByUuid() {
  //   this.isBankShimmer = true;
  //   this.dataService.getEmployeeBankDetails(this.userId).subscribe(
  //     (data) => {
  //       this.bankDetailsEmployee = data;

  //       this.isBankShimmer = false;
  //     },
  //     (error) => {
  //       this.isBankShimmer = false;
  //     }
  //   );
  // }

  refrences: any;

  onboardingPreviewData: OnboardingFormPreviewResponse =
  new OnboardingFormPreviewResponse();

  onboardingPreviewDataCopy: OnboardingFormPreviewResponse =
  new OnboardingFormPreviewResponse();


  getOnboardingFormPreviewMethodCall() {
    const userUuid = new URLSearchParams(window.location.search).get('userId') || '';
    if (userUuid) {
      this.dataService.getOnboardingFormPreview(userUuid).subscribe(
        (preview) => {
          // console.log(preview);
          this.onboardingPreviewData = preview;
          this.refrences = this.onboardingPreviewData.userGuarantorInformation;
          this.user = this.onboardingPreviewData.user;
          this.addressEmployee = this.onboardingPreviewData.userAddress;
          this.academicEmployee = this.onboardingPreviewData.userAcademics;
          this.experienceEmployee = this.onboardingPreviewData.userExperience;
          this.emergencyContacts = this.onboardingPreviewData.userEmergencyContacts;
          this.bankDetailsEmployee = this.onboardingPreviewData.userBankDetails;
          this.editProfile();
        },
        (error: any) => {
          console.error('Error fetching user details:', error);
          this.emergencyContacts = [];
        }
      );
    } else {
      console.error('User UUID not found');
      this.emergencyContacts = [];
    }
  }
  routes: string[] =[];
  loadRoutes(): void {
    this.dataService.getRoutesByOrganization(this.userId).subscribe(
      (routes: string[]) => {
        this.routes = routes;
        this.dataService.onboardingRoutes=routes;
        console.log('Loaded routes:', this.routes);
      },
      error => {
        console.error('Error fetching routes', error);
      }
    );
  }

  saveOnboardingData() {
    this.dataService.saveOnboardingData(this.onboardingPreviewDataCopy).subscribe({
      next: (response) => {
        this.profileEdit=false;
        this.helperService.showToast('Data Save successfully.', Key.TOAST_STATUS_SUCCESS);
        this.getOnboardingFormPreviewMethodCall();
        this.getPendingRequest();
      },
      error: (error) => {
        console.error('Error saving data:', error);
        this.helperService.showToast(error, Key.TOAST_STATUS_ERROR);
      }
    });
  }

  editProfile(){
    this.onboardingPreviewDataCopy = JSON.parse(JSON.stringify(this.onboardingPreviewData));
    if(this.onboardingPreviewDataCopy.userAddress == null){
      this.onboardingPreviewDataCopy.userAddress = [];
    }
    if(this.onboardingPreviewDataCopy.userAddress.length<2){
      while(this.onboardingPreviewDataCopy.userAddress.length!=2){
        this.onboardingPreviewDataCopy.userAddress.push(new UserAddressRequest());
      }
    }
    if(this.onboardingPreviewDataCopy.userGuarantorInformation == null || this.onboardingPreviewDataCopy.userGuarantorInformation.length==0){
      this.onboardingPreviewDataCopy.userGuarantorInformation= [];
      this.onboardingPreviewDataCopy.userGuarantorInformation.push(new UserGuarantorRequest());
    }
    if(!this.onboardingPreviewDataCopy.userAcademics){
      this.onboardingPreviewDataCopy.userAcademics=new UserAcademicsDetailRequest();
    }
    if(this.onboardingPreviewDataCopy.userEmergencyContacts == null || this.onboardingPreviewDataCopy.userEmergencyContacts.length==0){
      this.onboardingPreviewDataCopy.userEmergencyContacts = [];
      this.onboardingPreviewDataCopy.userEmergencyContacts.push(new UserEmergencyContactDetailsRequest());
    }
    if(this.onboardingPreviewDataCopy.userExperience == null || this.onboardingPreviewDataCopy.userExperience.length == 0){
      // this.onboardingPreviewDataCopy.userExperience.push(new UserExperience());
      this.onboardingPreviewDataCopy.userExperience = new Array();
      this.onboardingPreviewDataCopy.userExperience.push(new UserExperience());
    }
  }


  profileEditRequest: any = null;
  statusMessage: string = '';
  isRequestable: boolean=false;
  editStatus:string='';
  createProfileEditRequest() {

    this.dataService.createRequest(this.userId).subscribe(
      (response) => {
          this.editStatus = 'PENDING';
      },
      (error) => {
        console.error('Error creating request:', error);
      }
    );
  }

  // Get pending request for user
  getPendingRequest() {
    this.dataService.getPendingRequestForUser(this.userId).subscribe(
      (response) => {
          this.editStatus = response.status;
          if(this.editStatus == 'EDITED' && this.rbacService.userInfo.role == 'USER'){
            this.editStatus = '';
          }

      },
      (error) => {
        console.error('Error getting pending request:', error);
      }
    );
  }

  // Set status to pending
  changeStatus(status:String) {
    this.dataService.profileEditStatus(status,this.userId).subscribe(
      (response) => {

        this.editStatus = 'APPROVED';

      },
      (error) => {
        console.error('Error updating status:', error);
      }
    );
  }

  @ViewChild('profileRequestModal') profileRequestModal!:ElementRef;





}
