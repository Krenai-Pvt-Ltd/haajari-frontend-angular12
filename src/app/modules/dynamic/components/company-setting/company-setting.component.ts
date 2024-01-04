import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { OrganizationPersonalInformationRequest } from 'src/app/models/organization-personal-information-request';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-company-setting',
  templateUrl: './company-setting.component.html',
  styleUrls: ['./company-setting.component.css']
})
export class CompanySettingComponent implements OnInit {

  organizationPersonalInformationRequest: OrganizationPersonalInformationRequest = new OrganizationPersonalInformationRequest();

  constructor(private dataService: DataService,private afStorage: AngularFireStorage) { }

  ngOnInit(): void {
    this.getOrganizationDetailsMethodCall();
  }

  isFileSelected = false;
  onFileSelected(event: Event): void {
    debugger
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
          this.organizationPersonalInformationRequest.logo=url;
        });
      })
    ).subscribe();
}


isEditMode: boolean = false;

  
  enableEditMode(): void {
    this.isEditMode = true;
  }

   isUpdating: boolean = false;
   selectedFile: File | null = null;
   toggle = false;
  updateOrganizationPersonalInformationMethodCall(){
    this.isUpdating = true;
    this.isEditMode = false;
    this.dataService.updateOrganizationPersonalInformation(this.organizationPersonalInformationRequest)
    .subscribe(
      (response: OrganizationPersonalInformationRequest) => {
        console.log(response);  
        this.isUpdating = false;     
      },
      (error) => {
        console.error(error);
        
      })
  }


  companyLogoFileName: string = '';
  isLoading = true;
  getOrganizationDetailsMethodCall() {
    debugger
    this.dataService.getOrganizationDetails().subscribe(
      (response: OrganizationPersonalInformationRequest)=> {
          this.organizationPersonalInformationRequest = response;
          this.isLoading = false;
          this.setImageUrlFromDatabase(response.logo);
          this.companyLogoFileName = this.getFilenameFromUrl(response.logo);
          console.log(this.organizationPersonalInformationRequest);
             
      }, (error) => {
        console.log(error);
      }
    )
}

dbImageUrl: string | null = null;
setImageUrlFromDatabase(url: string) {
  this.dbImageUrl = url;
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
}
