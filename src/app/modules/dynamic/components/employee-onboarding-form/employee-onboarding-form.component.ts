import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
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

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      const file = fileList[0];
      const reader = new FileReader();
  
      reader.onload = (e: any) => {
        // Get the image element and set the src to the file reader result
        const imagePreview: HTMLImageElement = document.getElementById('imagePreview') as HTMLImageElement;
        imagePreview.src = e.target.result;
      };
  
      reader.readAsDataURL(file);
      this.uploadFile(file);
    }
  }
  
  
  uploadFile(file: File): void {
    const filePath = `uploads/${new Date().getTime()}_${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);
  
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(url => {
          console.log("File URL:", url);
          this.userPersonalInformationRequest.image = url; // Save the file URL
          // After upload, update personal details
          this.setEmployeePersonalDetailsMethodCall();
        });
      })
    ).subscribe();
  }
  

  
   userPersonalDetailsStatus = "";
  setEmployeePersonalDetailsMethodCall() {
    
    const userUuid = new URLSearchParams(window.location.search).get('userUuid') || '';
    this.dataService.markStepAsCompleted(1);
   
    this.dataService.setEmployeePersonalDetails(this.userPersonalInformationRequest, userUuid)
      .subscribe(
        (response: UserPersonalInformationRequest) => {
          console.log(response);  
          
          if (!userUuid) {
            // localStorage.setItem('uuidNewUser', response.uuid);
            this.dataService.setEmployeePersonalDetails(this.userPersonalInformationRequest, userUuid)
            // this.userPersonalDetailsStatus = response.statusResponse;
            // localStorage.setItem('statusResponse', JSON.stringify(this.userPersonalDetailsStatus));
            this.dataService.markStepAsCompleted(1);
          }  
          
          // this.router.navigate(['/employee-address-detail']);
        },
        (error) => {
          console.error(error);
        }
      );
  }
  


  getNewUserPersonalInformationMethodCall() {
    debugger
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
  
    if (userUuid) {
      this.dataService.getNewUserPersonalInformation(userUuid).subscribe(
        (response: UserPersonalInformationRequest) => {
          this.userPersonalInformationRequest = response;
          this.dataService.markStepAsCompleted(1);
        },
        (error: any) => {
          console.error('Error fetching user details:', error);
          
        }
      );
    } else {
      console.error('uuidNewUser not found in localStorage');
      
    }
  } 

  changeMethodCall(file : Event){
    console.log(file);
  }
  
}
