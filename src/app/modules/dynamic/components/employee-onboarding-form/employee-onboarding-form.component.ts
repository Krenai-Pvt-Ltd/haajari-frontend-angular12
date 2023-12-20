import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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

  isFileSelected = false;

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      this.isFileSelected = true;
      const file = fileList[0];
      const reader = new FileReader();
  
      reader.onload = (e: any) => {
        // Get the image element and set the src to the file reader result
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
    if (this.registerForm.valid) {
    const formData = this.registerForm.value;
    this.dataService.setEmployeePersonalDetails(formData, userUuid)
      .subscribe(
        (response: UserPersonalInformationRequest) => {
          console.log(response);  
          
          if (!userUuid) {
            // localStorage.setItem('uuidNewUser', response.uuid);
            this.dataService.setEmployeePersonalDetails(formData, userUuid)
            // this.userPersonalDetailsStatus = response.statusResponse;
            // localStorage.setItem('statusResponse', JSON.stringify(this.userPersonalDetailsStatus));
            this.dataService.markStepAsCompleted(1);
          }  
          
          // this.router.navigate(['/employee-address-detail']);
        },
        (error) => {
          console.error(error);
        })
      } else {
        // Handle invalid form case
      }
      ;
  }
  


  getNewUserPersonalInformationMethodCall() {
    debugger
    const userUuid = new URLSearchParams(window.location.search).get('userUuid');
  
    if (userUuid) {
      this.dataService.getNewUserPersonalInformation(userUuid).subscribe(
        (response: UserPersonalInformationRequest) => {
          // this.userPersonalInformationRequest = response;
          this.registerForm.patchValue(response);
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

  registerForm = new FormGroup({
    name: new FormControl({value: '', disabled: true}, [Validators.required]),
    image: new FormControl(""),
    email: new FormControl({value: '', disabled: true}, [Validators.required, Validators.email]),
    phoneNumber: new FormControl("", [Validators.required,Validators.pattern("[0-9]*"), Validators.minLength(10), Validators.maxLength(10)]),
    dob: new FormControl("", [Validators.required]),
    gender: new FormControl("", [Validators.required]),
    fatherName: new FormControl("", [Validators.required]),
    maritalStatus: new FormControl("", [Validators.required]),
    joiningDate: new FormControl("", [Validators.required]),
    currentSalary: new FormControl("", [Validators.required,Validators.pattern("[0-9]*")]),
    department: new FormControl("", [Validators.required]),
    position: new FormControl("", [Validators.required]),
    nationality: new FormControl("", [Validators.required])
  });
  
  registerSubmited(){
    console.log(this.registerForm);
  }

  get name(): FormControl{
    return this.registerForm.get("name") as FormControl;
  }

  get email(): FormControl{
    return this.registerForm.get("email") as FormControl;
  }

  get image(): FormControl{
    return this.registerForm.get("image") as FormControl;
  }

  get phoneNumber(): FormControl{
    return this.registerForm.get("phoneNumber") as FormControl;
  }

  get dob(): FormControl {
    return this.registerForm.get("dob") as FormControl;
  }
  
  get gender(): FormControl {
    return this.registerForm.get("gender") as FormControl;
  }
  
  get fatherName(): FormControl {
    return this.registerForm.get("fatherName") as FormControl;
  }
  
  get maritalStatus(): FormControl {
    return this.registerForm.get("maritalStatus") as FormControl;
  }
  
  get joiningDate(): FormControl {
    return this.registerForm.get("joiningDate") as FormControl;
  }
  
  get currentSalary(): FormControl {
    return this.registerForm.get("currentSalary") as FormControl;
  }
  
  get department(): FormControl {
    return this.registerForm.get("department") as FormControl;
  }
  
  get position(): FormControl {
    return this.registerForm.get("position") as FormControl;
  }
  
  get nationality(): FormControl {
    return this.registerForm.get("nationality") as FormControl;
  }
  
}
