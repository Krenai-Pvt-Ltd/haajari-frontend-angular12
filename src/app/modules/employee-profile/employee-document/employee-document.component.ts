import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { UserDocumentsAsList } from 'src/app/models/UserDocumentsMain';
import { DataService } from 'src/app/services/data.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-employee-document',
  templateUrl: './employee-document.component.html',
  styleUrls: ['./employee-document.component.css']
})
export class EmployeeDocumentComponent implements OnInit {

  uploadDoucument: boolean = false;
  userId: any;


  constructor(private dataService: DataService,private activateRoute: ActivatedRoute,
    public domSanitizer: DomSanitizer, private firebaseStorage: AngularFireStorage,
  ) {
    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }
  }

  ngOnInit(): void {
    this.getEmployeeDocumentsDetailsByUuid();
  }

  isDocsPlaceholder: boolean = false;
  documentsEmployee: UserDocumentsAsList[] = [];
  highSchoolCertificate: string = '';
  degreeCert: string = '';
  intermediateCertificate: string = '';
  testimonialsString: string = '';
  aadhaarCardString: string = '';
  pancardString: string = '';
  getEmployeeDocumentsDetailsByUuid() {

    this.dataService.getEmployeeDocumentAsList(this.userId).subscribe(
      (data) => {
        this.documentsEmployee = data.listOfObject;
        this.mapDocumentUrls();
        if (this.documentsEmployee.length == 0) {
          this.isDocsPlaceholder = true;
        }
      },
      (error) => {
        this.isDocsPlaceholder = true;

      }
    );
  }

  private mapDocumentUrls() {
    for (let doc of this.documentsEmployee) {
      switch (doc.documentName) {
        case 'highSchool':
          this.highSchoolCertificate = doc.documentUrl;
          break;
        case 'highestQualification':
          this.degreeCert = doc.documentUrl;
          break;
        case 'secondarySchool':
          this.intermediateCertificate = doc.documentUrl;
          break;
        case 'testimonial':
          this.testimonialsString = doc.documentUrl;
          break;
        case 'aadhaarCard':
          this.aadhaarCardString = doc.documentUrl;
          break;
        case 'pancard':
          this.pancardString = doc.documentUrl;
          break;
      }
    }
  }


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

  uploadFile(event: Event, doc: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Handle file upload logic here
      console.log('Uploading file for document:', doc.documentName, file);
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

}
