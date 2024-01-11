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
  maxDob: string;
  minJoiningDate: string;
  constructor(private dataService: DataService, private router: Router, private activateRoute: ActivatedRoute, private afStorage: AngularFireStorage) { 

    // DOB Date logic
        const today = new Date();
        const minAge = 18;
        const maxDobDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
        this.maxDob = maxDobDate.toISOString().split('T')[0]; // Format to 'YYYY-MM-DD'

        // Joining Date Logic
        
        this.minJoiningDate = today.toISOString().split('T')[0]; // Format to 'YYYY-MM-DD'
  }

  ngOnInit(): void {
    this.getNewUserPersonalInformationMethodCall();
  }


  routeToUserDetails() {
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') },
    };
    this.router.navigate(['/employee-onboarding/employee-address-detail'], navExtra);
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
            this.dataService.markStepAsCompleted(response.statusId);
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
                  this.dataService.markStepAsCompleted(response.statusId);
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

  departments: string[] = [
    'Accounting', 'Administration', 'Business Development', 'Communications', 'Compliance',
    'Customer Service', 'Design', 'Distribution', 'Engineering', 'Environmental, Health, and Safety (EHS)',
    'Finance', 'Human Resources', 'Information Technology (IT)', 'Legal', 'Logistics',
    'Maintenance', 'Manufacturing', 'Marketing', 'Operations', 'Procurement',
    'Product Development', 'Project Management', 'Public Relations', 'Quality Assurance', 'Research and Development (R&D)',
    'Sales', 'Supply Chain Management', 'Sustainability', 'Training and Development', 'Treasury', 'other'
];


selectDepartment(dept: string): void {
  this.userPersonalInformationRequest.department = dept;
}

selectNationality(name: string): void {
  this.userPersonalInformationRequest.nationality = name;
}

countries: string[] = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 
  'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 
  'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 
  'Comoros', 'Congo, Democratic Republic of the', 'Congo, Republic of the', 'Costa Rica', 'Cote d’Ivoire', 'Croatia', 
  'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 
  'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 
  'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 'Korea, South', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 
  'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 
  'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 
  'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 
  'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 
  'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 
  'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 
  'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 
  'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 
  'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 
  'Yemen', 'Zambia', 'Zimbabwe'
];




}
