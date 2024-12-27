
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { OnboardingFormPreviewResponse } from 'src/app/models/onboarding-form-preview-response';
import { UserAcademicsDetailRequest } from 'src/app/models/user-academics-detail-request';
import { UserAddressDetailsRequest } from 'src/app/models/user-address-details-request';
import { UserAddressRequest } from 'src/app/models/user-address-request';
import { UserEmergencyContactDetailsRequest } from 'src/app/models/user-emergency-contact-details-request';
import { UserExperience } from 'src/app/models/user-experience';
import { UserGuarantorRequest } from 'src/app/models/user-guarantor-request';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { UserBankDetailRequest } from 'src/app/models/user-bank-detail-request';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReasonOfRejectionProfile } from 'src/app/models/reason-of-rejection-profile';
import { constant } from 'src/app/constant/constant';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.css']
})
export class PersonalInformationComponent implements OnInit {

  profileEdit: boolean = false;
  profileLoding: boolean = false;
  userId: any;
  onboardingForm!: FormGroup;
isFormInvalid: boolean=false;

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
        accountNumber: ['',  Validators.required],
        ifsc: ['', Validators.required],
      }),
      userExperience: this.fb.array([]),
      userEmergencyContacts: this.fb.array([]),
    });
    // this.fetchEditedFields();
    this.getOnboardingFormPreviewMethodCall();
    this.loadRoutes();
    // this.getPendingRequest();
    this.fetchRequestedData();
  }



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

  requestedData: OnboardingFormPreviewResponse = new OnboardingFormPreviewResponse();
  fetchRequestedData(): void {

    this.dataService.getRequestedData(this.userId).subscribe({
      next: (response) => {
        this.requestedData = response;
        console.log('Fetched Data:', response);
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }
  findEmergencyContactWithId(id: number): any {
    return this.requestedData.userEmergencyContacts.find(contact => contact.id === id);
  }
  findAllEmergencyContactWithNullId(): any {
    return this.requestedData.userEmergencyContacts.filter(contact => contact.id === 0 || contact.id === null);
  }
  findExperienceWithId(id: number): any {
    return this.requestedData.userExperience.find(experience => experience.id === id);
  }
  findAllExperienceWithNullId(): any {
    return this.requestedData.userExperience.filter(experience => experience.id === 0 || experience.id === null);
  }
  findGuarantorWithId(id: number): any {
    return this.requestedData.userGuarantorInformation.find(guarantor => guarantor.id === id);
  }
  findAllGuarantorWithNullId(): any {
    return this.requestedData.userGuarantorInformation.filter(guarantor => guarantor.id === 0 || guarantor.id === null);
  }
  approveRequestedData(): void {
    this.dataService.saveRequestedData(this.userId).subscribe({
      next: (response) => {
        console.log('Response:', response);
        if (response.success) {
          this.helperService.showToast('Data saved successfully', Key.TOAST_STATUS_SUCCESS);
        } else {
          this.helperService.showToast('Failed to save data', Key.TOAST_STATUS_ERROR);
        }
      },
      error: (error) => {
        console.error('Error:', error);
        this.helperService.showToast('An error occurred while saving data', Key.TOAST_STATUS_ERROR);
      },
    });
  }

  getOnboardingFormPreviewMethodCall() {
    this.profileLoding = true;
    const userUuid = new URLSearchParams(window.location.search).get('userId') || '';
    if (userUuid) {
      this.dataService.getUserAllData(userUuid).subscribe(
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
          this.profileLoding = false;
        },
      (error: any) => {
           this.profileLoding = false;
          console.error('Error fetching user details:', error);
          this.emergencyContacts = [];
        }
      );
    } else {
        this.profileLoding = false;
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
        if(!this.routes.includes('/employee-address-detail') ){
          this.onboardingForm.removeControl('currentAddress');
          this.onboardingForm.removeControl('permanentAddress');
        }
        if(!this.routes.includes('/acadmic') ){
          this.onboardingForm.removeControl('academicDetails');
        }
        if(!this.routes.includes('/bank-details') ){
          this.onboardingForm.removeControl('bankDetails');
        }
        console.log('Loaded routes:', this.routes);
      },
      error => {
        console.error('Error fetching routes', error);
      }
    );
  }

  isSaveBtnLoading: boolean=false;
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
    if(this.onboardingForm.valid){
      this.isSaveBtnLoading=true;
      this.dataService.saveAllUserData(this.onboardingPreviewDataCopy,this.userId).subscribe({
        next: (response) => {
          this.profileEdit=false;
          this.isSaveBtnLoading=false;
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
    else{
      this.isFormInvalid=true;
      this.helperService.showToast('Some required fields are incorrect or missing. Please fix them', Key.TOAST_STATUS_ERROR);
    }


  }

  editProfile(){
    this.onboardingPreviewDataCopy = JSON.parse(JSON.stringify(this.onboardingPreviewData));
    if(this.routes.includes('/employee-address-detail') && this.onboardingPreviewDataCopy.userAddress == null){
      this.onboardingPreviewDataCopy.userAddress = [];
    }
    if(this.routes.includes('/employee-address-detail') && this.onboardingPreviewDataCopy.userAddress.length<2){
      while(this.onboardingPreviewDataCopy.userAddress.length!=2 && this.onboardingPreviewDataCopy.userAddress.length<3){
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
    if(this.routes.includes('/bank-details') && !this.onboardingPreviewDataCopy.userBankDetails){
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
    if (!this.onboardingPreviewData.userGuarantorInformation) {
      this.onboardingPreviewData.userGuarantorInformation = [];
    }
    if(this.onboardingPreviewData.userGuarantorInformation.length > this.references.length){
      this.onboardingPreviewDataCopy.userGuarantorInformation.push(this.onboardingPreviewData.userGuarantorInformation[this.references.length]);
    }
    else{
      this.onboardingPreviewDataCopy.userGuarantorInformation.push(new UserGuarantorRequest());
    }
    const referenceGroup = this.fb.group({
        name: [this.onboardingPreviewDataCopy.userGuarantorInformation[this.onboardingPreviewDataCopy.userGuarantorInformation.length-1].name, Validators.required],
        relation: [this.onboardingPreviewDataCopy.userGuarantorInformation[this.onboardingPreviewDataCopy.userGuarantorInformation.length-1].relation, Validators.required],
        phoneNumber: [this.onboardingPreviewDataCopy.userGuarantorInformation[this.onboardingPreviewDataCopy.userGuarantorInformation.length-1].phoneNumber, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        emailId: [this.onboardingPreviewDataCopy.userGuarantorInformation[this.onboardingPreviewDataCopy.userGuarantorInformation.length-1].emailId, [Validators.required, Validators.email]],
    });
    this.references.push(referenceGroup);
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
    if (!this.onboardingPreviewData.userExperience) {
      this.onboardingPreviewData.userExperience = [];
    }
    if(this.onboardingPreviewData.userExperience.length > this.references.length){
      this.onboardingPreviewDataCopy.userExperience.push(this.onboardingPreviewData.userExperience[this.references.length]);
    }
    else{
      this.onboardingPreviewDataCopy.userExperience.push(new UserExperience());
    }
    this.userExperience.push(
      this.fb.group({
        companyName: [this.onboardingPreviewDataCopy.userExperience[this.onboardingPreviewDataCopy.userExperience.length-1].companyName, Validators.required],
        startDate: [this.onboardingPreviewDataCopy.userExperience[this.onboardingPreviewDataCopy.userExperience.length-1].startDate, Validators.required],
        endDate: [this.onboardingPreviewDataCopy.userExperience[this.onboardingPreviewDataCopy.userExperience.length-1].endDate, Validators.required],
        lastJobPosition: [this.onboardingPreviewDataCopy.userExperience[this.onboardingPreviewDataCopy.userExperience.length-1].lastJobPosition, Validators.required],
        lastSalary: [this.onboardingPreviewDataCopy.userExperience[this.onboardingPreviewDataCopy.userExperience.length-1].lastSalary, [Validators.required, Validators.min(0)]],
        lastJobDepartment: [this.onboardingPreviewDataCopy.userExperience[this.onboardingPreviewDataCopy.userExperience.length-1].lastJobDepartment, Validators.required],
        jobResponsibilities: [this.onboardingPreviewDataCopy.userExperience[this.onboardingPreviewDataCopy.userExperience.length-1].jobResponisibilities, Validators.required],
      })
    );
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
    if (!this.userEmergencyContacts) {
      this.onboardingForm.setControl('userEmergencyContacts', this.fb.array([]));
    }
    if (!this.onboardingPreviewData.userEmergencyContacts) {
      this.onboardingPreviewData.userEmergencyContacts = [];
    }
    if(this.onboardingPreviewData.userEmergencyContacts.length > this.userEmergencyContacts.length){
      this.onboardingPreviewDataCopy.userEmergencyContacts.push(this.onboardingPreviewData.userEmergencyContacts[this.userEmergencyContacts.length]);
    }
    else{
      this.onboardingPreviewDataCopy.userEmergencyContacts.push(new UserEmergencyContactDetailsRequest());
    }
    this.userEmergencyContacts.push(this.fb.group({
      relationWithEmployee: [this.onboardingPreviewDataCopy.userEmergencyContacts[this.onboardingPreviewDataCopy.userEmergencyContacts.length-1].relationWithEmployee, Validators.required],
      contactName: [this.onboardingPreviewDataCopy.userEmergencyContacts[this.onboardingPreviewDataCopy.userEmergencyContacts.length-1].contactName, Validators.required],
      contactNumber: [this.onboardingPreviewDataCopy.userEmergencyContacts[this.onboardingPreviewDataCopy.userEmergencyContacts.length-1].contactNumber, [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    }));
  }

  removeEmergencyContact(index: number) {
    this.userEmergencyContacts.removeAt(index);
    this.onboardingPreviewDataCopy.userEmergencyContacts.splice(index, 1);
  }


  profileEditRequest: any = null;
  statusMessage: string = '';
  isEditReqLoading: boolean=false;
  editStatus:string='';
  @ViewChild('dismissRequestModal') dismissRequestModal!: ElementRef;

  createProfileEditRequest() {
    this.isEditReqLoading=true;
    this.dataService.createRequest(this.userId).subscribe(
      (response) => {
          this.editStatus = 'PENDING';
          this.dismissRequestModal.nativeElement.click();
          this.isEditReqLoading=false;
      },
      (error) => {
        console.error('Error creating request:', error);
        this.isEditReqLoading=false;
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
  isLoading = false;
  changeStatus(status:String) {
    this.isLoading = true;
    this.dataService.profileEditStatus(status,this.userId).subscribe(
      (response) => {

        this.editStatus = 'APPROVED';
        this.isLoading = false;
        if(status==='approve'){
          this.helperService.showToast('Request Approved Successfully', Key.TOAST_STATUS_SUCCESS);
        } else if(status==='reject'){
          this.helperService.showToast('Status Rejected Successfully', Key.TOAST_STATUS_ERROR);
        }

      },
      (error) => {
        console.error('Error updating status:', error);
        this.isLoading = false;
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
      }
    );
  }


  reasonOfRejectionProfile: ReasonOfRejectionProfile =
    new ReasonOfRejectionProfile();
  toggle = false;
  approvedToggle = false;
  @ViewChild('closeRejectModalButton') closeRejectModalButton!: ElementRef;
  updateStatusUserByUuid(type: string) {

    if (type == 'REJECTED') {
      this.toggle = true;
      this.setReasonOfRejectionMethodCall();
      if (this.requestForMoreDocs == true) {
        type = 'REQUESTED';
        this.approvedToggle = false;

        // this.toggle = false;
      }
    } else if (type == 'APPROVED') {
      this.approvedToggle = true;
    }

    this.dataService.updateStatusUser(this.userId, type).subscribe(
      (data) => {
        this.closeRejectModalButton.nativeElement.click();
        // console.log('status updated:' + type);
        this.sendStatusResponseMailToUser(this.userId, type);
        this.reasonOfRejectionProfile = new ReasonOfRejectionProfile();
        this.toggle = false;

        // location.reload();
        // location.reload();
      },
      (error) => {}
    );
  }

  @ViewChild('openRejectModal') openRejectModal!: ElementRef;
  setReasonOfRejectionMethodCall() {

    this.dataService
      .setReasonOfRejection(this.userId, this.reasonOfRejectionProfile)
      .subscribe(
        (response: ReasonOfRejectionProfile) => {
          // console.log('Response:', response);
        },
        (error) => {
          // console.error('Error occurred:', error);
        }
      );
  }

  sendStatusResponseMailToUser(userUuid: string, requestString: string) {
    this.dataService
      .statusResponseMailToUser(userUuid, requestString)
      .subscribe(
        (data) => {
          //  console.log("mail send successfully");

          this.helperService.showToast(
            'Mail Sent Successfully',
            Key.TOAST_STATUS_SUCCESS
          );
          this.getUserByUuid();
          //  this.closeRejectModalButton.nativeElement.click();

          if (requestString == 'APPROVED') {
            this.toggle = false;
          }
          if (requestString == 'REJECTED') {
            this.approvedToggle = false;
          }
        },
        (error) => {
          this.helperService.showToast(error.message, Key.TOAST_STATUS_SUCCESS);
        }
      );
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
  requestForMoreDocs: boolean = false;
  requestUserForMoreDocs() {
    this.openRejectModal.nativeElement.click();
    this.requestForMoreDocs = true;
  }


  editedFields: any[] = [];
  fetchEditedFields(): void {
    this.dataService.getEditedFieldsByUserUuid(this.userId).subscribe(
      (data: any[]) => {
        this.editedFields = data;

      },
      (error) => {
        console.error('Error fetching Edited Fields:', error);
      }
    );
  }

  findValueByColumnNameAndRowId( columnName: string, rowId: number): string | undefined {
    const record = this.editedFields.find(item => item.columnName === columnName && item.rowId === rowId);
    return record ? record.value : undefined;
  }

  findByColumnName(columnName: string): any[] {
    if (!this.editedFields || !Array.isArray(this.editedFields)) {
      console.error("Invalid data provided.");
      return [];
    }
    return this.editedFields.filter(item => item.columnName === columnName);
  }



}
