
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
import { UserBankDetailRequest } from 'src/app/models/user-bank-detail-request';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.css']
})
export class PersonalInformationComponent implements OnInit {

  profileEdit: boolean = false;
  userId: any;
  onboardingForm!: FormGroup;
isFormInvalid: boolean=true;

  constructor(private dataService: DataService,private activateRoute: ActivatedRoute, private helperService : HelperService,
    public rbacService: RoleBasedAccessControlService, private fb: FormBuilder,
  ) {
    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }
  }

  ngOnInit(): void {

    this.onboardingForm = this.fb.group({
      user: this.fb.group({
        name: ['', Validators.required],
        maritalStatus: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        joiningDate: [null, Validators.required],
        phoneNumber: ['', Validators.pattern(/^[0-9]{10}$/)],
        // currentSalary: [''],
        gender: ['', Validators.required],
        department: ['', Validators.required],
        dateOfBirth: [null, Validators.required],
        position: ['',[ Validators.required, Validators.minLength(3)]],
        fatherName: ['', [Validators.required, Validators.minLength(3)]],
        nationality: ['', [Validators.required, Validators.minLength(3)]],
      }),
      currentAddress: this.fb.group({
        addressLine1: ['', Validators.required],
        addressLine2: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['', Validators.required],
        pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      }),
      permanentAddress: this.fb.group({
        addressLine1: ['', Validators.required],
        addressLine2: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['', Validators.required],
        pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      }),
      refrences: this.fb.array([]),

      academicDetails: this.fb.group({
        highestEducationalLevel: ['', Validators.required],
        degreeObtained: ['', Validators.required],
        fieldOfStudy: ['', Validators.required],
        institutionName: ['', Validators.required],
        grade: ['', Validators.required],
        graduationYear: ['', Validators.required],
      }),
      bankDetails: this.fb.group({
        accountHolderName: ['', Validators.required],
        bankName: ['', Validators.required],
        accountNumber: ['', [
          Validators.required,
          Validators.pattern('^[0-9]{10}$')
        ]],
        ifsc: ['', Validators.required],
      }),
      userExperience: this.fb.array([]),
      userEmergencyContacts: this.fb.array([]),
    });

    this.getOnboardingFormPreviewMethodCall();
    this.loadRoutes();
    this.getPendingRequest();

  }

  user: any = {};
  isImage: boolean = false;


  addressEmployee: any[] = [];

  academicEmployee: any;
  isAcademicPlaceholder: boolean = false;


  isFresher: boolean = false;
  experienceEmployee: any;
  isCompanyPlaceholder: boolean = false;

  emergencyContacts: any;
  isContactPlaceholder: boolean = false;

  bankDetailsEmployee: any;
  isBankShimmer: boolean = false;


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
    this.userExperience.controls.forEach((control, index) => {
      const experience = control.value;

      // Directly assign values to the existing object
      const targetExperience = this.onboardingPreviewDataCopy.userExperience[index];
      targetExperience.companyName = experience.companyName;
      targetExperience.startDate = experience.startDate;
      targetExperience.endDate = experience.endDate;
      targetExperience.lastJobPosition = experience.lastJobPosition;
      targetExperience.lastSalary = experience.lastSalary;
      targetExperience.lastJobDepartment = experience.lastJobDepartment;
      targetExperience.jobResponisibilities = experience.jobResponsibilities;
    });

    // Sync userEmergencyContacts
    this.userEmergencyContacts.controls.forEach((control, index) => {
      const contact = control.value;

      // Directly assign values to the existing object
      const targetContact = this.onboardingPreviewDataCopy.userEmergencyContacts[index];
      targetContact.relationWithEmployee = contact.relationWithEmployee;
      targetContact.contactName = contact.contactName;
      targetContact.contactNumber = contact.contactNumber;
    });

    this.references.controls.forEach((control, index) => {
      const reference = control.value;

      // Directly assign values to the existing object
      const targetReference = this.onboardingPreviewDataCopy.userGuarantorInformation[index];
      targetReference.name = reference.name;
      targetReference.relation = reference.relation;
      targetReference.phoneNumber = reference.phoneNumber;
      targetReference.emailId = reference.emailId;
    });

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
    if(this.routes.includes('/employee-address-detail') && this.onboardingPreviewDataCopy.userAddress == null){
      this.onboardingPreviewDataCopy.userAddress = [];
    }
    if(this.routes.includes('/employee-address-detail') && this.onboardingPreviewDataCopy.userAddress.length<2){
      while(this.onboardingPreviewDataCopy.userAddress.length!=2){
        this.onboardingPreviewDataCopy.userAddress.push(new UserAddressRequest());
      }
    }
    if(this.onboardingPreviewDataCopy.userGuarantorInformation == null || this.onboardingPreviewDataCopy.userGuarantorInformation.length==0){
      this.onboardingPreviewDataCopy.userGuarantorInformation= [];
      // this.onboardingPreviewDataCopy.userGuarantorInformation.push(new UserGuarantorRequest());
    }
    if(this.routes.includes('/acadmic') && !this.onboardingPreviewDataCopy.userAcademics){
      this.onboardingPreviewDataCopy.userAcademics=new UserAcademicsDetailRequest();
    }
    if(this.routes.includes('/emergency-contact') && (this.onboardingPreviewDataCopy.userEmergencyContacts == null || this.onboardingPreviewDataCopy.userEmergencyContacts.length==0)){
      this.onboardingPreviewDataCopy.userEmergencyContacts = [];
      // this.onboardingPreviewDataCopy.userEmergencyContacts.push(new UserEmergencyContactDetailsRequest());
    }
    if(this.routes.includes('/employee-experience') && (this.onboardingPreviewDataCopy.userExperience == null || this.onboardingPreviewDataCopy.userExperience.length == 0)){
      this.onboardingPreviewDataCopy.userExperience = new Array();
      // this.onboardingPreviewDataCopy.userExperience.push(new UserExperience());
    }
    if(this.routes.includes('/bank-details') && !this.onboardingPreviewDataCopy.userAcademics){
      this.onboardingPreviewDataCopy.userBankDetails=new UserBankDetailRequest();
    }
    if (!this.references || this.references.length==0) {
      this.onboardingForm.setControl('references', this.fb.array([]));
      this.onboardingPreviewDataCopy.userGuarantorInformation.forEach((reference) => {

      this.references.push(this.fb.group({
        name: [reference.name, Validators.required],
        relation: [reference.relation, Validators.required],
        phoneNumber: [reference.phoneNumber, [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        emailId: [reference.emailId, [Validators.required, Validators.email]],
      }));
     });
    }
    if (!this.userExperience || this.userExperience.length==0) {
      this.onboardingForm.setControl('userExperience', this.fb.array([]));
      this.onboardingPreviewDataCopy.userExperience.forEach((experience) => {
      this.userExperience.push(
        this.fb.group({
          companyName: [experience.companyName, Validators.required],
          startDate: [experience.startDate, Validators.required],
          endDate: [experience.endDate, Validators.required],
          lastJobPosition: [experience.lastJobPosition, Validators.required],
          lastSalary: [experience.lastSalary, [Validators.required, Validators.min(0)]],
          lastJobDepartment: [experience.lastJobDepartment, Validators.required],
          jobResponsibilities: [experience.jobResponisibilities, Validators.required],
        }));
      });
    }
    if (!this.userEmergencyContacts || this.userEmergencyContacts.length==0) {
      debugger;
      this.onboardingForm.setControl('userEmergencyContacts', this.fb.array([]));
      this.onboardingPreviewDataCopy.userEmergencyContacts.forEach((contact) => {
        this.userEmergencyContacts.push(this.fb.group({
          relationWithEmployee: [contact.relationWithEmployee, Validators.required],
          contactName: [contact.contactName, Validators.required],
          contactNumber: [contact.contactNumber, [Validators.required, Validators.pattern('^[0-9]{10}$')]]
        }));
      });
    }

  }

  get references(): FormArray {
    return this.onboardingForm.get('references') as FormArray;
  }
  addReference() {
    if (!this.references) {
      this.onboardingForm.setControl('references', this.fb.array([]));
    }
    const referenceGroup = this.fb.group({
        name: ['', Validators.required],
        relation: ['', Validators.required],
        phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        emailId: ['', [Validators.required, Validators.email]],
    });
    this.references.push(referenceGroup);
    this.onboardingPreviewDataCopy.userGuarantorInformation.push(new UserGuarantorRequest());
  }

  removeReference(index: number) {
    this.references.removeAt(index);
    this.onboardingPreviewDataCopy.userGuarantorInformation.splice(index, 1);
  }

  get userExperience(): FormArray {
    return this.onboardingForm.get('userExperience') as FormArray;
  }
  addJobExperience(): void {
    debugger
    if (!this.userExperience) {
      this.onboardingForm.setControl('userExperience', this.fb.array([]));
    }
    this.userExperience.push(
      this.fb.group({
        companyName: ['', Validators.required],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        lastJobPosition: ['', Validators.required],
        lastSalary: ['', [Validators.required, Validators.min(0)]],
        lastJobDepartment: ['', Validators.required],
        jobResponsibilities: ['', Validators.required],
      })
    );
    this.onboardingPreviewDataCopy.userExperience.push(new UserExperience());
  }

  // Remove a job experience by index
  removeJobExperience(index: number): void {
    this.userExperience.removeAt(index);
    this.onboardingPreviewDataCopy.userExperience.splice(index, 1);
  }

  get userEmergencyContacts(): FormArray {
    return this.onboardingForm.get('userEmergencyContacts') as FormArray;
  }
  addEmergencyContact() {
    this.userEmergencyContacts.push(this.fb.group({
      relationWithEmployee: ['', Validators.required],
      contactName: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    }));
    this.onboardingPreviewDataCopy.userEmergencyContacts.push(new UserEmergencyContactDetailsRequest());
  }

  removeEmergencyContact(index: number) {
    this.userEmergencyContacts.removeAt(index);
    this.onboardingPreviewDataCopy.userEmergencyContacts.splice(index, 1);
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







}
