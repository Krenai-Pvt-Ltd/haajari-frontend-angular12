import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';
import { Key } from 'src/app/constant/key';
import { EmployeeAdditionalDocument } from 'src/app/models/employee-additional-document';
import { UserDocumentsDetailsRequest } from 'src/app/models/user-documents-details-request';
import { UserDocumentsRequest } from 'src/app/models/user-documents-request';
import { UserGuarantorRequest } from 'src/app/models/user-guarantor-request';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { PreviewFormComponent } from '../preview-form/preview-form.component';

@Component({
  selector: 'app-employee-document',
  templateUrl: './employee-document.component.html',
  styleUrls: ['./employee-document.component.css']
})
export class EmployeeDocumentComponent implements OnInit {

  userId: any;
  userDocumentsDetailsRequest: UserDocumentsDetailsRequest = new UserDocumentsDetailsRequest();
selectedHighSchoolCertificateFileName: any;
  constructor(private router : Router, public dataService : DataService,
    private activateRoute: ActivatedRoute,
    private afStorage: AngularFireStorage,
    private helperService: HelperService,
    private modalService: NgbModal) {
      if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
        this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
      }
    }

  ngOnInit(): void {
    this.getEmployeeDocumentsDetailsMethodCall();
    this.userDocumentsDetailsRequest = new UserDocumentsDetailsRequest();

    // Initialize the guarantors array with two new instances for the form
    this.userDocumentsDetailsRequest.guarantors = [
      new UserGuarantorRequest(), // Placeholder for the first guarantor
      new UserGuarantorRequest()  // Placeholder for the second guarantor
    ];
  }



  userDocumentsStatus = "";


  routeToUserDetails() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    if(this.dataService.isRoutePresent('/acadmic')){
      this.router.navigate(
        ['/employee-onboarding/acadmic'],
        navExtra
      );
    }else if(this.dataService.isRoutePresent('/employee-experience')){
      this.router.navigate(
        ['/employee-onboarding/employee-experience'],
        navExtra
      );
    }else if(this.dataService.isRoutePresent('/bank-details')){
      this.router.navigate(
        ['/employee-onboarding/bank-details'],
        navExtra
      );
    }else if(this.dataService.isRoutePresent('/emergency-contact')){
      this.router.navigate(
        ['/employee-onboarding/emergency-contact'],
        navExtra
      );
    }
  }

  // onFileSelected(event: any, documentType: string): void {
  //   const file = event.target.files[0];
  //   if (file) {
  //     this.uploadFile(file, documentType);
  //   }
  // }

  isInvalidFileType = false;
isValidFileType(file: File): boolean {
  const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
  const fileType = file.type.split('/').pop(); // Get the file extension from the MIME type

  if (fileType && validExtensions.includes(fileType.toLowerCase())) {
    this.isInvalidFileType = true;
    return true;
  }
  console.log(this.isInvalidFileType);
  this.isInvalidFileType = false;
  return false;
}

  selectedSecondarySchoolFileName: string = '';
  selectedHighSchoolFileName: string = '';
  selectedHighestQualificationDegreeFileName: string = '';
  selectedTestimonialReccomendationFileName: string = '';
  selectedAadhaarCardFileName: string = '';
  selectedpancardFileName: string = '';
  isUploading: boolean = false;


  isUploadingAadhaarCard: boolean = false;
  isUploadingPancard: boolean = false;
  isUploadingHighestQualificationDegree: boolean = false;
  isUploadingSecondarySchoolCertificate: boolean = false;
  isUploadingHighSchoolCertificate: boolean = false;

  uploadFile(file: File, documentType: string): void {

    switch (documentType) {
      case 'aadhaarCard':
        this.isUploadingAadhaarCard = true;
        break;
      case 'pancard':
        this.isUploadingPancard = true;
        break;
      case 'highestQualificationDegree':
        this.isUploadingHighestQualificationDegree = true;
        break;
        case 'secondarySchoolCertificate':
          this.isUploadingSecondarySchoolCertificate = true;
          break;
        case 'highSchoolCertificate':
          this.isUploadingHighSchoolCertificate = true;
          break;
    }
    const filePath = `documents/${new Date().getTime()}_${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);

    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(url => {
          switch (documentType) {
            case 'aadhaarCard':
              this.isUploadingAadhaarCard = false;
              break;
            case 'pancard':
              this.isUploadingPancard = false;
              break;
            case 'highestQualificationDegree':
              this.isUploadingHighestQualificationDegree = false;
              break;
              case 'secondarySchoolCertificate':
              this.isUploadingSecondarySchoolCertificate = false;
              break;
            case 'highSchoolCertificate':
              this.isUploadingHighSchoolCertificate = false;
              break;
          }
          this.assignDocumentUrl(documentType, url);

          // this.setEmployeeDocumentsDetailsMethodCall();
        });
      })
    ).subscribe();
  }

  assignDocumentUrl(documentType: string, url: string): void {
    if (!this.userDocumentsDetailsRequest.userDocuments) {
      this.userDocumentsDetailsRequest.userDocuments = new UserDocumentsRequest();
    }

    switch (documentType) {
      case 'secondarySchoolCertificate':
        this.userDocumentsDetailsRequest.userDocuments.secondarySchoolCertificate = url;
        break;
      case 'highSchoolCertificate':
        this.userDocumentsDetailsRequest.userDocuments.highSchoolCertificate = url;
        break;
      case 'highestQualificationDegree':
        this.userDocumentsDetailsRequest.userDocuments.highestQualificationDegree = url;
        break;
      case 'testimonialReccomendation':
        this.userDocumentsDetailsRequest.userDocuments.testimonialReccomendation = url;
        break;
        case 'aadhaarCard':
        this.userDocumentsDetailsRequest.userDocuments.aadhaarCard = url;
        break;
        case 'pancard':
        this.userDocumentsDetailsRequest.userDocuments.pancard = url;
        break;
    }
  }


  selectedFile: File | null = null;
  toggle = false;
  toggleSave =  false;
  setEmployeeDocumentsDetailsMethodCall(): void {
    debugger

    if(this.userDocumentsDetailsRequest.employeeAdditionalDocument==null){
      this.userDocumentsDetailsRequest.employeeAdditionalDocument = [];
    }
    if(this.buttonType=='next'){
      this.toggle = true;
      this.userDocumentsDetailsRequest.directSave = false;
      this.userDocumentsDetailsRequest.updateRequest = false;
    } else if (this.buttonType=='save'){
      this.toggleSave = true;
      this.userDocumentsDetailsRequest.updateRequest = false;
    } else if (this.buttonType=='update'){
      this.toggle = true;
      this.userDocumentsDetailsRequest.updateRequest = true;
    }
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    if(this.selectedFile) {

      this.uploadFile(this.selectedFile, 'string');
  }
  // console.log(this.userDocumentsDetailsRequest);
  this.dataService.setEmployeeDocumentsDetails(this.userDocumentsDetailsRequest, userUuid)

  .subscribe(
    (response: UserDocumentsDetailsRequest) => {
      // console.log('Response:', response);
      // console.log(this.userDocumentsDetailsRequest);
      this.toggle = false
      this.employeeOnboardingFormStatus = response.employeeOnboardingStatus;
      this.handleOnboardingStatus(response.employeeOnboardingStatus);

      // Perform further actions like navigation or state updates
      if(this.buttonType=='next'){
        this.routeToUserDetails();
        this.dataService.markStepAsCompleted(response.statusId);
      } else if (this.buttonType=='save'){
        if(this.employeeOnboardingFormStatus!='REJECTED'){
          this.successMessageModalButton.nativeElement.click();
        }
          setTimeout(() => {

            this.routeToFormPreview();
          }, 2000);
      } else if (this.buttonType=='update'){
        this.helperService.showToast("Information Updated Successfully", Key.TOAST_STATUS_SUCCESS);

       }
    },
    (error) => {
      console.error('Error occurred:', error);
      this.toggle = false
    }

  );

    if (!userUuid) {
      console.error('User UUID is missing.');
      return;
    }






  }


  // Properties to hold filenames extracted from URLs
secondarySchoolCertificateFileName: string = '';
highSchoolCertificateFileName1: string = '';
highestQualificationDegreeFileName1: string = '';
testimonialReccomendationFileName1: string = '';
aadhaarCardFileName: string = '';
pancardFileName: string = '';

// Properties to determine if the file input should be required
isSecondarySchoolCertificateRequired: boolean = false;
isHighSchoolCertificateRequired: boolean = false;
isHighestQualificationDegreeRequired: boolean = true;
isaadhaarCardRequired: boolean = true;
ispancardRequired: boolean = true;

isNewUser: boolean = true;
isLoading:boolean = true;
employeeOnboardingFormStatus:string|null=null;
@ViewChild("successMessageModalButton") successMessageModalButton!:ElementRef;
async getEmployeeDocumentsDetailsMethodCall(): Promise<boolean> {
  debugger
  return new Promise<boolean>(async (resolve, reject) => {
  const userUuid = new URLSearchParams(window.location.search).get('userUuid');
  const adminUuid = new URLSearchParams(window.location.search).get('adminUuid');
  if (userUuid) {
    this.dataService.getEmployeeDocumentDetails(userUuid).subscribe(
      async (response: UserDocumentsDetailsRequest) => {
        this.userDocumentsDetailsRequest = response;
        this.employeeOnboardingFormStatus = response.employeeOnboardingStatus;
        if(adminUuid){
          await this.getAdminVerifiedForOnboardingUpdateMethodCall(); // This will now work
        }
        if(response.employeeOnboardingFormStatus == 'USER_REGISTRATION_SUCCESSFUL' && this.employeeOnboardingFormStatus != 'REJECTED' && !this.userDocumentsDetailsRequest.updateRequest){
          this.successMessageModalButton.nativeElement.click();
        }
        this.handleOnboardingStatus(response.employeeOnboardingStatus);
        this.dataService.markStepAsCompleted(response.statusId);
        if(this.userDocumentsDetailsRequest.userDocuments==undefined){
          this.userDocumentsDetailsRequest.userDocuments=new UserDocumentsRequest();
        }
        if(response.employeeOnboardingStatus == "PENDING"){
          this.isNewUser = false;
        }
          this.isLoading = false;
        if(response!=null){

        }
        if (response.employeeAdditionalDocument === undefined || response.employeeAdditionalDocument === null || response.employeeAdditionalDocument.length === 0) {
          response.employeeAdditionalDocument = [];
          this.employeeDocumentsName.forEach((documentName) => {
              const newDocument = new EmployeeAdditionalDocument();
              newDocument.name = documentName;
              response.employeeAdditionalDocument.push(newDocument);
          });
      }

        if (response.userDocuments) {

          this.secondarySchoolCertificateFileName = this.getFilenameFromUrl(response.userDocuments.secondarySchoolCertificate);
          // this.isSecondarySchoolCertificateRequired = !response.userDocuments.secondarySchoolCertificate;

          this.highSchoolCertificateFileName1 = this.getFilenameFromUrl(response.userDocuments.highSchoolCertificate);
          // this.isHighSchoolCertificateRequired = !response.userDocuments.highSchoolCertificate;

          this.highestQualificationDegreeFileName1 = this.getFilenameFromUrl(response.userDocuments.highestQualificationDegree);
          this.isHighestQualificationDegreeRequired = !response.userDocuments.highestQualificationDegree;

          this.aadhaarCardFileName = this.getFilenameFromUrl(response.userDocuments.aadhaarCard);
          this.isaadhaarCardRequired = !response.userDocuments.aadhaarCard;

          this.pancardFileName = this.getFilenameFromUrl(response.userDocuments.pancard);
          this.ispancardRequired = !response.userDocuments.pancard;

          this.testimonialReccomendationFileName1 = this.getFilenameFromUrl(response.userDocuments.testimonialReccomendation);
        }

        // Initialize guarantors if they are not part of the response
        debugger
        if (this.userDocumentsDetailsRequest.guarantors.length==0) {
          this.userDocumentsDetailsRequest.guarantors = [
            new UserGuarantorRequest(),
            // new UserGuarantorRequest()
          ];
        }
      },
      (error: any) => {
        console.error('Error fetching user details:', error);
      }
    );
  } else {
    console.error('User UUID not found.');
  }
})
}

  getFilenameFromUrl(url: string): string {
    if (!url) return '';

    const decodedUrl = decodeURIComponent(url);

    const parts = decodedUrl.split('/');

    const filenameWithQuery = parts.pop() || '';

    const filename = filenameWithQuery.split('?')[0];

    const cleanFilename = filename.replace(/^\d+_/,'');
    return cleanFilename;
  }

  @ViewChild("formSubmitButton") formSubmitButton!:ElementRef;


directSave: boolean = false;

submit(){
 this.checkFormValidation();

  if(this.isFormInvalid==true){
    return
  } else{
switch(this.buttonType){
  case "next" :{
    this.setEmployeeDocumentsDetailsMethodCall();
    break;
  }
  case "save" :{
    debugger
    this.userDocumentsDetailsRequest.directSave = true;
    this.setEmployeeDocumentsDetailsMethodCall();
    break;
  }
  case "update" :{
    debugger

    this.setEmployeeDocumentsDetailsMethodCall();
    break;
  }
}
  }
}

isFormInvalid: boolean = false;
@ViewChild ('documentsInformationForm') documentsInformationForm !: NgForm
checkFormValidation(){
if(this.documentsInformationForm.invalid){
this.isFormInvalid = true;
return
} else {
  this.isFormInvalid = false;
}
}
@ViewChild("dismissSuccessModalButton") dismissSuccessModalButton!:ElementRef;
routeToFormPreview() {
  this.dismissSuccessModalButton.nativeElement.click();
  setTimeout(x=>{
  let navExtra: NavigationExtras = {

    queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
  };
  this.router.navigate(['/employee-onboarding/employee-onboarding-preview'], navExtra);
},2000)
}

  displayModal = false;
  allowEdit = false;

  handleOnboardingStatus(response: string) {
    this.displayModal = true;
    switch (response) {

      case 'REJECTED':
        this.allowEdit = true;
        break;
        case 'APPROVED':
      case 'PENDING':
        this.allowEdit = false;
        break;
      default:
        this.displayModal = false;
        break;
    }
  }

  documentName: string = '';
  isAddMore: boolean = false;
  addNewDocument() {
    debugger

    if (!this.userDocumentsDetailsRequest.employeeAdditionalDocument) {
      this.userDocumentsDetailsRequest.employeeAdditionalDocument = [];
  }

    // Find the maximum ID in the current document list
    const maxId = this.userDocumentsDetailsRequest.employeeAdditionalDocument.reduce((max, doc) => doc.id > max ? doc.id : max, 0);

    // Create a new document object with a unique ID
    const newDocument: EmployeeAdditionalDocument = {
        id: maxId + 1, // Increment the maximum ID by 1
        name: this.documentName,
        url: '',
        fileName: '',
        uploading: false
        // Include other required properties of EmployeeAdditionalDocument, if any
    };

    this.userDocumentsDetailsRequest.employeeAdditionalDocument.push(newDocument);

    // Reset the input field for adding more documents
    this.documentName = '';
    this.isAddMore = false; // Hide the add more section if needed
}



addMore(){
  this.isAddMore = true;
}


assignAdditionalDocumentUrl(index: number, url: string): void {
  if (!this.userDocumentsDetailsRequest.employeeAdditionalDocument) {
      this.userDocumentsDetailsRequest.employeeAdditionalDocument = [];
  }

  if (!this.userDocumentsDetailsRequest.employeeAdditionalDocument[index]) {
      this.userDocumentsDetailsRequest.employeeAdditionalDocument[index] = new EmployeeAdditionalDocument();
  }

  this.userDocumentsDetailsRequest.employeeAdditionalDocument[index].url = url;
  this.userDocumentsDetailsRequest.employeeAdditionalDocument[index].fileName = this.getFilenameFromUrl(url);
}

deleteDocument(index: number): void {
  if (index > -1) {
      this.userDocumentsDetailsRequest.employeeAdditionalDocument.splice(index, 1);
  }
}


clearFile(event: MouseEvent, documentType: string): void {
  event.preventDefault();

  if (documentType === 'secondarySchoolCertificate') {
    this.userDocumentsDetailsRequest.userDocuments.secondarySchoolCertificate = "";
    this.selectedSecondarySchoolFileName = "";
    this.secondarySchoolCertificateFileName = "";

  } else if (documentType === 'highSchoolCertificate') {
    this.userDocumentsDetailsRequest.userDocuments.highSchoolCertificate = "";
    this.selectedHighSchoolCertificateFileName = "";
    this.highSchoolCertificateFileName1 = "";
    this.selectedHighSchoolFileName = "";

  } else if (documentType === 'aadhaarCard') {
    this.userDocumentsDetailsRequest.userDocuments.aadhaarCard = "";
    this.selectedAadhaarCardFileName = "";
    this.aadhaarCardFileName = "";

  } else if (documentType === 'pancard') {
    this.userDocumentsDetailsRequest.userDocuments.pancard = "";
    this.selectedpancardFileName = "";
    this.pancardFileName = "";

  } else if (documentType === 'highestQualificationDegree') {
    this.userDocumentsDetailsRequest.userDocuments.highestQualificationDegree = "";
    this.selectedHighestQualificationDegreeFileName = "";
    this.highestQualificationDegreeFileName1 = "";
  }
}


getAdminVerifiedForOnboardingUpdateMethodCall(): Promise<boolean> {
  debugger;
  return new Promise<boolean>((resolve, reject) => {
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
    const adminUuid = new URLSearchParams(window.location.search).get('adminUuid');
    if (userUuid && adminUuid) {
      this.dataService.getAdminVerifiedForOnboardingUpdate(userUuid, adminUuid).subscribe(
        (isAdminPresent: boolean) => {
          this.userDocumentsDetailsRequest.updateRequest = isAdminPresent;
          // console.log('Admin verification successful.');
          resolve(isAdminPresent); // Resolve the promise with the result
        },
        (error: any) => {
          console.error('Error fetching admin verification status:', error);
          // reject(error); // Reject the promise on error
        }
      );
    } else {
      console.error('User UUID or Admin UUID not found in the URL.');
      // reject(new Error('User UUID or Admin UUID not found in the URL.')); //Reject the promise if parameters are missing
    }
  });
}





employeeDocumentsName: string[] = ['Aadhaar Card', 'PAN Card', 'Highest Qualification Degree', '10th Marksheet', '12th Marksheet'];
documents: EmployeeAdditionalDocument[] = [];

onFileSelected(event: any, documentName: string): void {
  const file: File = event.target.files[0];
  if (file) {
    if (!documentName) {
      alert('Please provide a document name before uploading the file.');
      return;
    }

    const filePath = `employeeCompanyDocs/${new Date().getTime()}_${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);

    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            const newDocument: EmployeeAdditionalDocument = {
              fileName: file.name,
              name: documentName,
              url: url,
              id: 0,
              uploading: false,
             // value: '', // Set value if required, otherwise leave empty
            };
            this.documents.push(newDocument);
            console.log('File uploaded and document saved:', this.documents);
          });
        })
      )
      .subscribe();
  }
}

// getEmployeeDocumentsDetailsByUuid() {

//   this.dataService.getDocumentsByUserId(this.userUuid).subscribe({
//     next: (docs) => {
//       this.documents = docs;
//       console.log('Documents:', this.documents);
//     },
//     error: (err) => {
//       console.error('Error fetching documents:', err);
//     },
//   });
// }



onAdditionalFileSelected(event: Event, index: number): void {
  const fileInput = event.target as HTMLInputElement;
  const file = fileInput.files ? fileInput.files[0] : null;

  if (file) {
    if (this.isValidFileType(file)) {
      this.userDocumentsDetailsRequest.employeeAdditionalDocument[index].uploading = true;
      this.uploadAdditionalFile(file, index);
    } else {
      fileInput.value = '';
      this.isInvalidFileType = true; // Set flag for invalid file type
      console.error("Invalid file type. Please select a PDF, JPG, JPEG, or PNG file.");
    }
  }
}

uploadAdditionalFile(file: File, index: number): void {
  const filePath = `documents/${new Date().getTime()}_${file.name}`;
  const fileRef = this.afStorage.ref(filePath);
  const task = this.afStorage.upload(filePath, file);

  task.snapshotChanges().pipe(
    finalize(() => {
      fileRef.getDownloadURL().subscribe(url => {
        this.userDocumentsDetailsRequest.employeeAdditionalDocument[index].uploading = false;
        this.userDocumentsDetailsRequest.employeeAdditionalDocument[index].fileName = file.name;
        this.userDocumentsDetailsRequest.employeeAdditionalDocument[index].url = url;
        this.assignAdditionalDocumentUrl(index, url);
      }, error => {
        this.userDocumentsDetailsRequest.employeeAdditionalDocument[index].uploading = false;
        console.error("Error retrieving download URL:", error);
      });
    })
  ).subscribe();
}

preventLeadingWhitespace(event: KeyboardEvent): void {
  const inputElement = event.target as HTMLInputElement;

  // Prevent space if it's the first character
  if (event.key === ' ' && inputElement.selectionStart === 0) {
    event.preventDefault();
  }

}

backRedirectUrl() {
  // Retrieve userUuid from the URL query parameters
  const userUuid = new URLSearchParams(window.location.search).get('userUuid');

  // Initialize an empty object for queryParams
  let queryParams: any = {};

  // Add userUuid to queryParams if it exists
  if (userUuid) {
    queryParams['userUuid'] = userUuid;
  }

  // Conditionally add adminUuid to queryParams if updateRequest is true
  if (this.userDocumentsDetailsRequest.updateRequest) {
    const adminUuid = new URLSearchParams(window.location.search).get('adminUuid');
    if (adminUuid) {
      queryParams['adminUuid'] = adminUuid;
    }
  }

  // Create NavigationExtras object with the queryParams
  let navExtra: NavigationExtras = { queryParams };

  // Navigate to the specified route with the query parameters

if(this.dataService.isRoutePresent('/employee-address-detail')){
      this.router.navigate(
        ['/employee-onboarding/employee-address-detail'],
        navExtra
      );
}else {
  this.router.navigate(
    ['/employee-onboarding/employee-onboarding-form'],
    navExtra
  );

}
}

goBackToProfile() {
  let navExtra: NavigationExtras = {
    queryParams: { userId: new URLSearchParams(window.location.search).get('userUuid') },
  };
  // this.router.navigate([Key.EMPLOYEE_PROFILE_ROUTE], navExtra);
  const url = this.router.createUrlTree([Key.EMPLOYEE_PROFILE_ROUTE], navExtra).toString();
    window.open(url, '_blank');
    return;
}

buttonType:string="next"
selectButtonType(type:string){
  this.buttonType=type;
  this.userDocumentsDetailsRequest.directSave = false;
  this.formSubmitButton.nativeElement.click();
  if(type === 'preview'){
    const modalRef = this.modalService.open(PreviewFormComponent, {
      centered: true,
      size: 'lg', backdrop: 'static'
    });
    }
}



}
