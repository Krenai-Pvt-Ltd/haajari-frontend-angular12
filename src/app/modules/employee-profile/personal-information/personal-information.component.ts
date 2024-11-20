import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { constant } from 'src/app/constant/constant';
import { OnboardingFormPreviewResponse } from 'src/app/models/onboarding-form-preview-response';
import { UserAddressDetailsRequest } from 'src/app/models/user-address-details-request';
import { UserExperienceDetailRequest } from 'src/app/models/user-experience-detail-request';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.css']
})
export class PersonalInformationComponent implements OnInit {

  profileEdit: boolean = false;
  userId: any;

  constructor(private dataService: DataService,private activateRoute: ActivatedRoute,) {
    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }
  }

  ngOnInit(): void {
    this.getOnboardingFormPreviewMethodCall();

  }

  user: any = {};
  isImage: boolean = false;

  getUserByUuid() {
    this.dataService.getUserByUuid(this.userId).subscribe(
      (data) => {
        this.user = data;

        if (constant.EMPTY_STRINGS.includes(this.user.image)) {
          this.isImage = false;
        } else {
          this.isImage = true;
        }
      },
      (error) => {
        this.isImage = false;
      }
    );
  }

  addressEmployee: any[] = [];
  getEmployeeAdressDetailsByUuid() {
    // this.isAddressShimmer=true;
    this.dataService.getNewUserAddressDetails(this.userId).subscribe(
      (data: UserAddressDetailsRequest) => {
          this.addressEmployee = data.userAddressRequest;
      },
      (error) => {

      }
    );
  }

  academicEmployee: any;
  isAcademicPlaceholder: boolean = false;

  getEmployeeAcademicDetailsByUuid() {
    this.dataService.getEmployeeAcademicDetails(this.userId).subscribe(
      (data) => {
        if (data != null || data != undefined) {
          this.academicEmployee = data;
        } else {
          this.isAcademicPlaceholder = true;
        }
      },
      (error) => {
        this.isAcademicPlaceholder = true;
      }
    );
  }

  isFresher: boolean = false;
  experienceEmployee: any;
  isCompanyPlaceholder: boolean = false;
  getEmployeeExperiencesDetailsByUuid() {
    this.dataService.getEmployeeExperiencesDetails(this.userId).subscribe(
      (data: UserExperienceDetailRequest) => {
        this.experienceEmployee = data;

        if (this.experienceEmployee[0].fresher == true) {
          this.isFresher = this.experienceEmployee[0].fresher;
        }
        // console.log('experience length' + this.experienceEmployee.length);
        if (data == undefined || data == null || data.experiences?.length == 0) {
          this.isCompanyPlaceholder = true;
        }
      },
      (error) => {
        this.isCompanyPlaceholder = true;
      }
    );
  }

  emergencyContacts: any;
  isContactPlaceholder: boolean = false;
  getEmergencyContactsDetailsByUuid() {
    this.dataService.getEmployeeContactsDetails(this.userId).subscribe(
      (data) => {
        this.emergencyContacts = data;
        if (data == null || data.length == 0) {
          this.isContactPlaceholder = true;
        }
      },
      (error) => {
        this.isContactPlaceholder = true;
      }
    );
  }

  bankDetailsEmployee: any;
  isBankShimmer: boolean = false;
  getEmployeeBankDetailsByUuid() {
    this.isBankShimmer = true;
    this.dataService.getEmployeeBankDetails(this.userId).subscribe(
      (data) => {
        this.bankDetailsEmployee = data;

        this.isBankShimmer = false;
      },
      (error) => {
        this.isBankShimmer = false;
      }
    );
  }

  refrences: any;

  onboardingPreviewData: OnboardingFormPreviewResponse =
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



}
