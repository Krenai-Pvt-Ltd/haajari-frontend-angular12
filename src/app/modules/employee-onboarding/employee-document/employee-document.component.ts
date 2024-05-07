import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Key } from 'src/app/constant/key';
import { EmployeeAdditionalDocument } from 'src/app/models/employee-additional-document';
import { UserDocumentsDetailsRequest } from 'src/app/models/user-documents-details-request';
import { UserDocumentsRequest } from 'src/app/models/user-documents-request';
import { UserGuarantorRequest } from 'src/app/models/user-guarantor-request';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-employee-document',
  templateUrl: './employee-document.component.html',
  styleUrls: ['./employee-document.component.css']
})
export class EmployeeDocumentComponent implements OnInit {


  userDocumentsDetailsRequest: UserDocumentsDetailsRequest = new UserDocumentsDetailsRequest();
selectedHighSchoolCertificateFileName: any;
  constructor(private router : Router, private dataService : DataService, private afStorage: AngularFireStorage, private helperService: HelperService) { }

  ngOnInit(): void {
    this.getEmployeeDocumentsDetailsMethodCall();
    this.userDocumentsDetailsRequest = new UserDocumentsDetailsRequest();

    // Initialize the guarantors array with two new instances for the form
    this.userDocumentsDetailsRequest.guarantors = [
      new UserGuarantorRequest(), // Placeholder for the first guarantor
      new UserGuarantorRequest()  // Placeholder for the second guarantor
    ];
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
    this.router.navigate(['/employee-onboarding/employee-address-detail'], navExtra);
  }

  userDocumentsStatus = "";


  routeToUserDetails() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/employee-onboarding/acadmic'], navExtra);
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

  onFileSelected(event: Event, documentType: string): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      const file = fileList[0];
      // Check if the file type is valid before proceeding
      if (this.isValidFileType(file)) { // Call isValidFileType method to check the file type
        // Proceed only if the file type is valid
        if (documentType === 'secondarySchoolCertificate') {
          this.selectedSecondarySchoolFileName = file.name;
        }
        if (documentType === 'highSchoolCertificate') {
          this.selectedHighSchoolFileName = file.name;
        }
        if (documentType === 'highestQualificationDegree') {
          this.selectedHighestQualificationDegreeFileName = file.name;
        }
        if (documentType === 'testimonialReccomendation') {
          this.selectedTestimonialReccomendationFileName = file.name;
        }
        if (documentType === 'aadhaarCard') {
          this.selectedAadhaarCardFileName = file.name;
        }
        if (documentType === 'pancard') {
          this.selectedpancardFileName = file.name;
        }
        // Use FileReader to read the file if it's an image for preview
        const reader = new FileReader();
    
        reader.onload = (e: any) => {
          const imagePreview: HTMLImageElement = document.getElementById('imagePreview') as HTMLImageElement;
          imagePreview.src = e.target.result;
        };
    
        reader.readAsDataURL(file);
        // Now upload the file since it's a valid type
        this.uploadFile(file, documentType);
      } else {
        element.value = '';
        // Handle invalid file type here (optional)
        console.error("Invalid file type.");
      }
    }
  }
  
  
  uploadFile(file: File, documentType: string): void {
    const filePath = `documents/${new Date().getTime()}_${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);
  
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(url => {
        
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
  console.log(this.userDocumentsDetailsRequest);
  this.dataService.setEmployeeDocumentsDetails(this.userDocumentsDetailsRequest, userUuid)
    
  .subscribe(
    (response: UserDocumentsDetailsRequest) => {
      console.log('Response:', response);
      console.log(this.userDocumentsDetailsRequest);
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

buttonType:string="next"
selectButtonType(type:string){
  this.buttonType=type;
  this.userDocumentsDetailsRequest.directSave = false;
  this.formSubmitButton.nativeElement.click();
}

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
        fileName: ''
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

onAdditionalFileSelected(event: Event, index: number): void {
  const fileInput = event.target as HTMLInputElement;
  const file = fileInput.files ? fileInput.files[0] : null;

  if (file && this.isValidFileType(file)) { // Check if the file is valid before proceeding
    // If the file type is valid, proceed with the upload
    this.uploadAdditionalFile(file, index);
  } else {
    fileInput.value = '';
    // Optionally handle the case when the file is invalid
    // For example, you could alert the user or log an error
    console.error("Invalid file type. Please select a JPG, JPEG, or PNG file.");
  }
}

uploadAdditionalFile(file: File, index: number): void {
  const filePath = `documents/${new Date().getTime()}_${file.name}`;
  const fileRef = this.afStorage.ref(filePath);
  const task = this.afStorage.upload(filePath, file);

  // Handle the file upload task
  task.snapshotChanges().pipe(
      finalize(() => {
          fileRef.getDownloadURL().subscribe(url => {
              // Update the URL in the corresponding document
              this.userDocumentsDetailsRequest.employeeAdditionalDocument[index].url = url;
              this.assignAdditionalDocumentUrl(index, url);
              // If you have additional steps to perform after setting the URL, do them here
          });
      })
  ).subscribe();
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


preventLeadingWhitespace(event: KeyboardEvent): void {
  const inputElement = event.target as HTMLInputElement;

  // Prevent space if it's the first character
  if (event.key === ' ' && inputElement.selectionStart === 0) {
    event.preventDefault();
  }

}

clearFile(event: MouseEvent, documentType: string): void {
  event.preventDefault();
  if (documentType == 'secondarySchoolCertificate') {
    this.userDocumentsDetailsRequest.userDocuments.secondarySchoolCertificate = "";
    this.selectedSecondarySchoolFileName = "";
    this.secondarySchoolCertificateFileName = "";
    
  } else if (documentType == 'highSchoolCertificate'){
    this.userDocumentsDetailsRequest.userDocuments.highSchoolCertificate = "";
    this.selectedHighSchoolCertificateFileName = "";
    this.highSchoolCertificateFileName1 = "";
    this.selectedHighSchoolFileName = "";
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
          console.log('Admin verification successful.');
          resolve(isAdminPresent); // Resolve the promise with the result
        },
        (error: any) => {
          console.error('Error fetching admin verification status:', error);
          reject(error); // Reject the promise on error
        }
      );
    } else {
      console.error('User UUID or Admin UUID not found in the URL.');
      reject(new Error('User UUID or Admin UUID not found in the URL.')); // Reject the promise if parameters are missing
    }
  });
}


goBackToProfile() {
  let navExtra: NavigationExtras = {
    queryParams: { userId: new URLSearchParams(window.location.search).get('userUuid') },
  };
  this.router.navigate(['/employee-profile'], navExtra);
}


}
