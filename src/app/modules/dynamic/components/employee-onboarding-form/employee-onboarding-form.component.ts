import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { url } from 'inspector';
import { finalize } from 'rxjs/operators';
import { UserPersonalInformationRequest } from 'src/app/models/user-personal-information-request';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-employee-onboarding-form',
  templateUrl: './employee-onboarding-form.component.html',
  styleUrls: ['./employee-onboarding-form.component.css']
})
export class EmployeeOnboardingFormComponent implements OnInit {
 

  userPersonalInformationRequest: UserPersonalInformationRequest = new UserPersonalInformationRequest();

  constructor(private dataService: DataService, private router: Router, private activateRoute: ActivatedRoute, private afStorage: AngularFireStorage) { }

  ngOnInit(): void {
    this.getNewUserPersonalInformationMethodCall();
  }


  routeToUserDetails() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/employee-address-detail'], navExtra);
  }

  isFileSelected = false;

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imagePreview: HTMLImageElement = document.getElementById('imagePreview') as HTMLImageElement;
        imagePreview.src = e.target.result;
      };
      reader.readAsDataURL(file);

      this.uploadFile(file); 
    } else {
      this.isFileSelected = false;
    }
  }

  
  
  uploadFile(file: File): void {
    debugger
    const filePath = `uploads/${new Date().getTime()}_${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);
  
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(url => {

          console.log("File URL:", url);
          this.userPersonalInformationRequest.image=url;
        });
      })
    ).subscribe();
}

  


   userPersonalDetailsStatus = "";
   selectedFile: File | null = null;
   toggle = false;
  setEmployeePersonalDetailsMethodCall() {
debugger
    
    this.toggle = true;
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    this.dataService.markStepAsCompleted(1);
  
    this.dataService.setEmployeePersonalDetails(this.userPersonalInformationRequest, userUuid)
      .subscribe(
        (response: UserPersonalInformationRequest) => {
          console.log(response);  
          this.toggle = false
          if (!userUuid) {
            // localStorage.setItem('uuidNewUser', response.uuid);
            this.dataService.setEmployeePersonalDetails(this.userPersonalInformationRequest, userUuid)
            // this.userPersonalDetailsStatus = response.statusResponse;
            // localStorage.setItem('statusResponse', JSON.stringify(this.userPersonalDetailsStatus));
            this.dataService.markStepAsCompleted(1);
          }  
          
          // this.router.navigate(['/employee-address-detail']);
          this.routeToUserDetails();
          
        },
        (error) => {
          console.error(error);
          this.toggle = false
        })
     
      ;
  }
  
  dbImageUrl: string | null = null;

  setImageUrlFromDatabase(url: string) {
      this.dbImageUrl = url;
  }
  isLoading:boolean = true;
  employeeOnboardingFormStatus:string|null=null;
  @ViewChild("successMessageModalButton") successMessageModalButton!:ElementRef;
  getNewUserPersonalInformationMethodCall() {
    debugger
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
    if (userUuid) {
        this.dataService.getNewUserPersonalInformation(userUuid).subscribe(
            (response: UserPersonalInformationRequest) => {
                this.userPersonalInformationRequest = response;
                this.isLoading = false;
                this.employeeOnboardingFormStatus=response.employeeOnboardingStatus.response;
                if(response.employeeOnboardingFormStatus.response=='USER_REGISTRATION_SUCCESSFUL'){
                  this.successMessageModalButton.nativeElement.click();
                }
                this.handleOnboardingStatus(response.employeeOnboardingStatus.response);
                console.log(response);
                if(response.dob){
                  this.dataService.markStepAsCompleted(1);
                }
                

               
                if (response.image) {
                    this.setImageUrlFromDatabase(response.image);
                }
            },
            (error: any) => {
                console.error('Error fetching user details:', error);
            }
        );
    } else {
        console.error('uuidNewUser not found in localStorage');
    }
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

  closeAndEdit() {
    this.displayModal = false;
    
  }

  closeModal() {
    this.displayModal = false;
    
  }





  
}
