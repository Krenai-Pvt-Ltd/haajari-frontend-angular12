import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NavigationExtras, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { UserDocumentsDetailsRequest } from 'src/app/models/user-documents-details-request';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-employee-document',
  templateUrl: './employee-document.component.html',
  styleUrls: ['./employee-document.component.css']
})
export class EmployeeDocumentComponent implements OnInit {


  userDocumentsDetailsRequest: UserDocumentsDetailsRequest = new UserDocumentsDetailsRequest();
  constructor(private router : Router, private dataService : DataService, private afStorage: AngularFireStorage) { }

  ngOnInit(): void {
    this.getEmployeeDocumentsDetailsMethodCall();
  }
  
  backRedirectUrl(){
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/employee-address-detail'], navExtra);
  }

  userDocumentsStatus = "";


  routeToUserDetails() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/acadmic'], navExtra);
  }

  // onFileSelected(event: any, documentType: string): void {
  //   const file = event.target.files[0];
  //   if (file) {
  //     this.uploadFile(file, documentType);
  //   }
  // }
  selectedFileName: string = '';
  selectedHighSchoolFileName: string = '';
  selectedHighestQualificationDegreeFileName: string = '';
  selectedTestimonialReccomendationFileName: string = '';
  onFileSelected(event: Event, documentType: string): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      const file = fileList[0];
      if (documentType === 'secondarySchoolCertificate') {
        this.selectedFileName = file.name;
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
      // this.selectedFileName = file.name;
      const reader = new FileReader();
  
      reader.onload = (e: any) => {
       
        const imagePreview: HTMLImageElement = document.getElementById('imagePreview') as HTMLImageElement;
        imagePreview.src = e.target.result;
      };
  
      reader.readAsDataURL(file);
      this.uploadFile(file, documentType);
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
          
          this.setEmployeeDocumentsDetailsMethodCall();
        });
      })
    ).subscribe();
  }
  
  assignDocumentUrl(documentType: string, url: string): void {
    switch (documentType) {
      case 'secondarySchoolCertificate':
        this.userDocumentsDetailsRequest.secondarySchoolCertificate = url;
        break;
      case 'highSchoolCertificate':
        this.userDocumentsDetailsRequest.highSchoolCertificate = url;
        break;
      case 'highestQualificationDegree':
        this.userDocumentsDetailsRequest.highestQualificationDegree = url;
        break;
      case 'testimonialReccomendation':
        this.userDocumentsDetailsRequest.testimonialReccomendation = url;
        break;
      
    }
  }
  
  setEmployeeDocumentsDetailsMethodCall(): void {
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    if (!userUuid) {
      console.error('User UUID is missing.');
      return;
    }
  
    
    this.dataService.markStepAsCompleted(2);
  
    
    this.dataService.setEmployeeDocumentsDetails(this.userDocumentsDetailsRequest, userUuid)
      .subscribe(
        (response: UserDocumentsDetailsRequest) => {
          console.log('Response:', response);
          // Perform further actions like navigation or state updates
        },
        (error) => {
          console.error('Error occurred:', error);
        }
      );
  }
  


  // setEmployeeDocumentsDetailsMethodCall() {
    
  //   const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
  //   this.dataService.markStepAsCompleted(2);
   
  //   this.dataService.setEmployeeDocumentsDetails(this.userDocumentsDetailsRequest, userUuid)
  //     .subscribe(
  //       (response: UserDocumentsDetailsRequest) => {
  //         console.log(response);  
          
  //         if (!userUuid) {
  //           // localStorage.setItem('uuidNewUser', response.uuid);
  //           this.dataService.setEmployeeDocumentsDetails(this.userDocumentsDetailsRequest, userUuid)
  //           // this.userPersonalDetailsStatus = response.statusResponse;
  //           // localStorage.setItem('statusResponse', JSON.stringify(this.userPersonalDetailsStatus));
  //           this.dataService.markStepAsCompleted(2);
  //         }  
          
  //         // this.router.navigate(['/employee-address-detail']);
  //       },
  //       (error) => {
  //         console.error(error);
  //       }
  //     );
  // }


  getEmployeeDocumentsDetailsMethodCall() {
    debugger
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
  
    if (userUuid) {
      this.dataService.getEmployeeDocumentsDetails(userUuid).subscribe(
        (response: UserDocumentsDetailsRequest) => {
          this.userDocumentsDetailsRequest = response;
          console.log(response);
          this.dataService.markStepAsCompleted(2);
        },
        (error: any) => {
          console.error('Error fetching user details:', error);
          
        }
      );
    } else {
      console.error('uuidNewUser not found in localStorage');
      
    }
  } 
}
