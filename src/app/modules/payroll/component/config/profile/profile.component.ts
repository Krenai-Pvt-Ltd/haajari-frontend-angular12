import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { PayrollTodoStep } from 'src/app/payroll-models/PayrollTodoStep';
import { Profile } from 'src/app/payroll-models/Profile';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollConfigurationService } from 'src/app/services/payroll-configuration.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  imageChangedEvent: any = null;
  base64: string | null = null;
  isUploading: boolean = false;
  isFileSelected: boolean = false;
  readonly constants = constant;


  isDivVisible: boolean = false;

  constructor(
     private _payrollConfigurationService :PayrollConfigurationService,
        private _helperService : HelperService,
        private afStorage: AngularFireStorage,
        private activateRoute: ActivatedRoute,
        private router: Router
  ) { 
    if (this.activateRoute.snapshot.queryParamMap.has('tab')) {
      this.currentTab = this.activateRoute.snapshot.queryParamMap.get('tab');
    }
  }

  ngOnInit(): void {
    this.getProfile();
    this.getTodoList();
  }

  selectedLocation: string = 'India';

  selectedCurrency: string = 'INR'; // INR selected by default

  stateCurrency = [
    { "code": "INR", "name": "INR", "symbol": "₹" }
  ];


  stateList=[
    { "id": 1, "name": "Andhra Pradesh" },
    { "id": 2, "name": "Arunachal Pradesh" },
    { "id": 3, "name": "Assam" },
    { "id": 4, "name": "Bihar" },
    { "id": 5, "name": "Chhattisgarh" },
    { "id": 6, "name": "Goa" },
    { "id": 7, "name": "Gujarat" },
    { "id": 8, "name": "Haryana" },
    { "id": 9, "name": "Himachal Pradesh" },
    { "id": 10, "name": "Jharkhand" },
    { "id": 11, "name": "Karnataka" },
    { "id": 12, "name": "Kerala" },
    { "id": 13, "name": "Madhya Pradesh" },
    { "id": 14, "name": "Maharashtra" },
    { "id": 15, "name": "Manipur" },
    { "id": 16, "name": "Meghalaya" },
    { "id": 17, "name": "Mizoram" },
    { "id": 18, "name": "Nagaland" },
    { "id": 19, "name": "Odisha" },
    { "id": 20, "name": "Punjab" },
    { "id": 21, "name": "Rajasthan" },
    { "id": 22, "name": "Sikkim" },
    { "id": 23, "name": "Tamil Nadu" },
    { "id": 24, "name": "Telangana" },
    { "id": 25, "name": "Tripura" },
    { "id": 26, "name": "Uttar Pradesh" },
    { "id": 27, "name": "Uttarakhand" },
    { "id": 28, "name": "West Bengal" }
  ]

  selectedFile: File | null = null;
  
    toggleDiv() {
      this.isDivVisible = !this.isDivVisible;
    }
    closeStatutoryDiv() {
     this.isDivVisible = false;
      this.tab= '';
    }
    
    
    
      selectedPfWage = "12% of Actual PF Wage"; 
  
  employer = [
    { label: "12% of Actual PF Wage", value: "12% of Actual PF Wage" },
    { label: "10% of Actual PF Wage", value: "10% of Actual PF Wage" }
  ];
  employee = [
    { label: "12% of Actual PF Wage", value: "12% of Actual PF Wage" },
    { label: "10% of Actual PF Wage", value: "10% of Actual PF Wage" }
  ];
  
  tab: string = '';
  switchTab(tab: string) {
    this.tab = tab
  }
   
  
  // ################# Profile #######################

    @ViewChild('profileForm') profileForm!: NgForm;
  
  
  formattedDate:string='';
  
  dateFormats = [
    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' }
  ];
  
  onDateFormatChange(format: string) {
    this.profile.dateFormat = format;
    const now = new Date();
    this.formattedDate = this.formatDate(now, format);
    console.log('Selected Date Format:',this.formattedDate );
  }

  formatDate(date: Date, format: string): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
  
    switch (format) {
      case 'dd/MM/yyyy':
        return `${day}/${month}/${year}`;
      case 'MM/dd/yyyy':
        return `${month}/${day}/${year}`;
      case 'yyyy-MM-dd':
        return `${year}-${month}-${day}`;
      default:
        return `${day}/${month}/${year}`;
    }

  }
  
  profile:Profile = new Profile();
  getProfile(){
      this._payrollConfigurationService.getOrganizationProfile().subscribe((response) => {
            if(response.status){
              this.profile= response.object;
              if(this.profile==null){
                this.profile = new Profile();
              }
            const now = new Date();
            this.formattedDate = this.formatDate(now, this.profile.dateFormat);
              this.profile.currency = this.profile.currency ? this.profile.currency : 'INR';
            }
          },
          (error) => {
    
          }
        );
      }
  
  
    saveLoader:boolean=false;
    saveOrganizationProfile(){
      this.saveLoader = true;
      this._payrollConfigurationService.saveOrganizationProfile(this.profile).subscribe((response) => {
          if(response.status){
            this._helperService.showToast("Your Organiization Profile has been saved.", Key.TOAST_STATUS_SUCCESS);
            this.profileForm.form.markAsUntouched();
          }else{
            this._helperService.showToast("Error saving your profile.", Key.TOAST_STATUS_ERROR);
          }
          this.saveLoader = false;
          setTimeout(() => {
            this.route('statutory');
        }, 2000);
        },
        (error) => {
          this.saveLoader = false;
          this._helperService.showToast("Error saving your profile.", Key.TOAST_STATUS_ERROR);

        }
      );
    }
  
    uploadFile(file: File): void {
        const filePath = "logo"+new Date().getTime()+file.name;
        const fileRef = this.afStorage.ref(filePath);
        const task = this.afStorage.upload(filePath, file);
    
        task.snapshotChanges().pipe(
            finalize(() => {
              fileRef.getDownloadURL().subscribe((url) => {
                this.profile.logo = url;
                this.isUploading=false;
              });
            })
          )
          .subscribe();
      }
  
    
  
      currentTab: any= 'profile';
      route(tabName: string) {
        this.router.navigate(['/payroll/configuration'], {
          queryParams: { tab: tabName },
        });
        this.currentTab=tabName;
      }
  
  
  
  
  fileChangeEvent(event: any): void {
    if (event.target.files.length > 0) {
      this.imageChangedEvent = event; 
    }
  }
  
  imageCropped(event: any): void {
    this.base64 = event.base64;
    this.uploadCroppedImage();
  }
  
  uploadCroppedImage(): void {
    if (!this.base64) {
      console.error('No image to upload!');
      return;
    }
  
    this.isUploading = true;
  
    const blob = this.dataURItoBlob(this.base64);
    const fileName = "cropped_"+new Date().getTime()+".png";
    const file = new File([blob], fileName, { type: 'image/png' });
  
    const filePath = "logo/"+fileName;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);
  
    task.snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.profile.logo = url; 
            this.isUploading = false;
          });
        })
      )
      .subscribe();
  }
  
  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([arrayBuffer], { type: mimeString });
  }
  
  toDoStepList:PayrollTodoStep[]=new Array();
     getTodoList() {
  
        this._payrollConfigurationService.getTodoList().subscribe(
          (response) => {
            if(response.status){
              this.toDoStepList = response.object;
              this.checkAllCompleted();
  
            }
          },
          (error) => {
    
          }
        );
      }
      checkAllCompleted(): boolean {
        return this.toDoStepList.every(step => step.completed);
      }
}
