import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { UserDocumentsAsList } from 'src/app/models/UserDocumentsMain';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { EmployeeAdditionalDocument } from 'src/app/models/EmployeeAdditionalDocument';
import { finalize } from 'rxjs/operators';
import { Key } from 'src/app/constant/key';
import { constant } from 'src/app/constant/constant';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { Routes } from 'src/app/constant/Routes';

@Component({
  selector: 'app-employee-document',
  templateUrl: './employee-document.component.html',
  styleUrls: ['./employee-document.component.css']
})
export class EmployeeDocumentComponent implements OnInit {
  readonly constant=constant;

  uploadDoucument: boolean = false;
  documentLoading: boolean = false;
  userId: any;
  docType: string= 'employee_doc';
  readonly Routes=Routes;

  setDocType(type: string) {
    debugger;
    this.docType = type;
    this.doc.documentType=type;
  }


  constructor(private dataService: DataService,private activateRoute: ActivatedRoute,
    public domSanitizer: DomSanitizer, private firebaseStorage: AngularFireStorage,
    private afStorage: AngularFireStorage, private helperService : HelperService,
    public roleService: RoleBasedAccessControlService,
  ) {
    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }
  }

  ROLE: string = '';
  async ngOnInit(): Promise<void> {
    this.getEmployeeDocumentsDetailsByUuid();
    this.ROLE = await this.roleService.getRole();
  }

  isDocsPlaceholder: boolean = false;
  documentsEmployee: UserDocumentsAsList[] = [];
  highSchoolCertificate: string = '';
  degreeCert: string = '';
  intermediateCertificate: string = '';
  testimonialsString: string = '';
  aadhaarCardString: string = '';
  pancardString: string = '';

  documents: EmployeeAdditionalDocument[] = [];
  getEmployeeDocumentsDetailsByUuid() {
    this.documentLoading = true;
    this.documents = [];
    this.dataService.getDocumentsByUserId(this.userId).subscribe({
      next: (docs) => {
        this.documents = docs;
         this.documentLoading = false;
      },
      error: (err) => {
         this.documentLoading = false;
        console.error('Error fetching documents:', err);
      },
    });
  }

  disableStartDates = (current: Date): boolean => {
    if (!this.doc.endDate) {
      return false;
    }
    // Disable dates after the selected end date
    return current.getTime() > new Date(this.doc.endDate).getTime();
  };

  disableEndDates = (current: Date): boolean => {
    if (!this.doc.startDate) {
      return false;
    }
    // Disable dates before the selected start date
    return current.getTime() < new Date(this.doc.startDate).getTime();
  };

  previewString: SafeResourceUrl = '';
  downloadString!: string;
  nextOpenDocString!: string;
  nextOpenDocName!: string;
  hideNextButton: boolean = false;
  @ViewChild('openViewModal') openViewModal!: ElementRef;
  openPdfModel(viewString: string) {

    this.downloadString = viewString;
    this.previewString =
      this.domSanitizer.bypassSecurityTrustResourceUrl(viewString);
      this.updateFileType(viewString);

    this.openViewModal.nativeElement.click();
  }

  isImage2: boolean = false;
  isPDF: boolean = false;
  private updateFileType(url: string) {
    const extension = url.split('?')[0].split('.').pop()?.toLowerCase();
    this.isImage2 = ['png', 'jpg', 'jpeg', 'gif'].includes(extension!);
    this.isPDF = extension === 'pdf';
  }

  downloadSingleImage(fileUrl: string) {
    if (!fileUrl) {
      return;
    }
    debugger
    fetch(fileUrl)
    .then(response => response.blob()) // Convert the image to a Blob
    .then(blob => {
      // Create a temporary URL for the Blob
      const blobUrl = URL.createObjectURL(blob);

      // Create a hidden link element
      const link = document.createElement('a');
      link.href = blobUrl;

      // Extract the file name from the URL or use a default name
      const fileName = fileUrl.split('/').pop()?.split('?')[0] || 'downloaded-file.jpg';

      link.download = fileName;  // This triggers the download

      // Simulate a click to start the download
      link.style.display = 'none';  // Hide the link
      document.body.appendChild(link); // Append the link to the body
      link.click(); // Trigger the download
      document.body.removeChild(link); // Remove the link from the DOM
      URL.revokeObjectURL(blobUrl); // Release the object URL
    })
    .catch(error => {
      console.error('Error downloading file:', error);
    });
  }

  deleteDocument(doc: UserDocumentsAsList): void {
    // Implement logic to delete a document
    console.log(`Deleting document: ${doc.documentName}`);
  }


  uploadFile(event: Event, doc: EmployeeAdditionalDocument): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.doc.name='';
      this.doc.id=doc.id;
      this.doc.value=doc.value;
      this.doc.name=doc.name;
      this.doc.documentType=doc.documentType;
      this.doc.fileName = file.name;
      this.uploadAdditionalFile(file);
      console.log('Uploading file for document:', doc.name, file);
    }
  }

  viewDocument(doc: any): void {
    if (doc.documentUrl) {
      window.open(doc.documentUrl, '_blank');
    }
  }

  isImage(url: string): boolean {
    const cleanUrl = url.split('?')[0];

    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(cleanUrl);
  }

  private fileTypeToIcon: { [key: string]: string } = {
    '.pdf': 'lar la-file-pdf text-danger',
    '.jpg': 'lar la-file-image text-success',
    '.jpeg': 'lar la-file-image text-success',
    '.png': 'lar la-file-image text-success',
    '.zip': 'lar la-file-archive text-warning',
  };

  getFileTypeIcon(fileUrl: string): string {
    const url = new URL(fileUrl, window.location.origin);
    const fileName = url.pathname.split('/').pop();
    const extension = `.${fileName?.split('.').pop()?.toLowerCase()}`;

    return this.fileTypeToIcon[extension] || 'lar la-file text-secondary';
  }


  isLoading: boolean=false;
  selectedFile: File | null = null;
  doc: EmployeeAdditionalDocument={fileName: '', name: '', url: '', value: ''};
  @ViewChild('closeButton') closeButton!: ElementRef;
  uploadAdditionalFile(file: File): void {
    const filePath = `employeeCompanyDocs/${new Date().getTime()}_${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.doc.url=url;
            if(this.doc.documentType!='employee_doc' && this.doc.documentType!='company_doc' && this.doc.documentType!='employee_agreement'){
              this.doc.documentType=this.docType;
            }
            this.dataService.saveDocumentForUser(this.userId, this.doc).subscribe({
              next: (response) => {
                console.log('Document saved successfully:', response);
                this.helperService.showToast('Document saved successfully:',Key.TOAST_STATUS_SUCCESS);
                this.isLoading=false;
                this.closeButton.nativeElement.click();
                this.getEmployeeDocumentsDetailsByUuid();
              },
              error: (err) => {
                this.helperService.showToast('Some problem in saving Document',Key.TOAST_STATUS_ERROR);
                this.isLoading=false;
              },
            });
          });
        })
      )
      .subscribe();
  }
  onFileSelected(event: Event): void {
    console.log(this.docType);
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.doc.fileName = this.selectedFile.name; // Save file name
    }
  }

  onSubmit(): void {
    if (this.selectedFile) {
      this.isLoading=true;
      this.uploadAdditionalFile(this.selectedFile);
    } else {
      console.error('No file selected!');
    }
  }

  isEmployeeAgreementChecked: boolean = false;
  isEmployeeAgreement(event: any): void {
    if(event.target.checked){
      this.isEmployeeAgreementChecked=true;
      this.doc.documentType=constant.DOC_TYPE_EMPLOYEE_AGREEMENT;
    }else{
      this.isEmployeeAgreementChecked=false;
      this.doc.documentType=constant.DOC_TYPE_COMPANY;
    }
  }

  @ViewChild('checkBox') checkBox!: ElementRef;
  onCloseModal(): void {
    this.doc = {fileName: '', name: '', url: '', value: ''};
    this.isEmployeeAgreementChecked = false;
    if (this.checkBox && this.checkBox.nativeElement) {
      this.checkBox.nativeElement.checked = false;
    }
  }

  ngAfterViewInit() {
    const modal = document.getElementById('addDocumentt');
    if (modal) {
      modal.addEventListener('hidden.bs.modal', () => {
        this.onCloseModal();
      });
    }
  }

  isCompanyDocsExist(){
    return this.documents.some(
      doc => doc.documentType === constant.DOC_TYPE_COMPANY || doc.documentType === constant.DOC_TYPE_EMPLOYEE_AGREEMENT
  );
  }
}
