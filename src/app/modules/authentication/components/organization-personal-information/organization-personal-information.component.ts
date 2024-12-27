import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import {
  Dimensions,
  ImageCroppedEvent,
  ImageTransform,
} from 'ngx-image-cropper';
import { Key } from 'src/app/constant/key';

import { OrganizationPersonalInformationMain } from 'src/app/models/organization-personal-information';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';
import { PlacesService } from 'src/app/services/places.service';
import {
  ViewChildren,
  QueryList,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import * as _ from 'lodash';
import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { constant } from 'src/app/constant/constant';
import { DomSanitizer } from '@angular/platform-browser';

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}
@Component({
  selector: 'app-organization-personal-information',
  templateUrl: './organization-personal-information.component.html',
  styleUrls: ['./organization-personal-information.component.css'],
})
export class OrganizationPersonalInformationComponent implements OnInit {
  // @ViewChild('fileInput') fileInput!: ElementRef;
  // imageChangedEvent: any = '';
  // croppedImage: any = '';
  originalFile: File | null = null;
  constructor(
    private dataService: DataService,
    public formatter: NgbDateParserFormatter,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private afStorage: AngularFireStorage,
    private _onboardingService: OrganizationOnboardingService,
    private placesService: PlacesService,
    private helperService: HelperService,
    private sanitizer: DomSanitizer
  ) {}

  showSuccessComponent : boolean = true;

  ngOnInit(): void {
    // this._onboardingService.refreshSidebar();
    this.getOrganizationDetails();
    const token = localStorage.getItem('token');
    if (token==null) {
      this.router.navigate(['/auth/signup']);
    }
  }

  organizationPersonalInformation: OrganizationPersonalInformationMain = {
    id: 0,
    adminName: '',
    name: '',
    email: '',
    password: '',
    logo: '',
    phoneNumber: '',
    organization: {
      id: 0,
      name: '',
      email: '',
      password: '',
      country: 0,
      state: '',
      token: '',
      webhook: '',
      appId: '',
      userToken: '',
      configureUrl: '',
      onboardingVia: '',
    },
  };
  timeZone: string = '';
  loading: boolean = false;
  registerOrganizationPersonalInformation(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // this.loading = true;
      this.timeZone = this.helperService.getTimeZone();
      this.dataService
        .registerOrganizationPersonalInformation(
          this.organizationPersonalInformation, this.timeZone
        )
        .subscribe(
          async (response) => {
            this.loading = false;
            this.isInfoLoading = false;
            // console.log('Organization personal info registered successfully.');
            // this.router.navigate(['/organization-onboarding/upload-team']);
            await this.dataService.markStepAsCompleted(2);
            this._onboardingService
              .saveOrgOnboardingStep(2)
              .subscribe((resp) => {
                this._onboardingService.refreshOnboarding();
              });
              this.helperService.registerOrganizationRegistratonProcessStepData(Key.COMPANY_SETTING_ID, Key.PROCESS_COMPLETED);
            resolve(true);
          },
          (error) => {
            this.loading = false;
            this.isInfoLoading = false;
            console.log(error.error.message);
            reject(error);
          }
        );
    });
  }

  getOrganizationDetails() {
    debugger;
    this.dataService.getOrganizationDetails().subscribe(
      (data) => {
        this.organizationPersonalInformation = data;
        this.imageUrl = this.organizationPersonalInformation.logo;
        // console.log('imageUrl' + this.imageUrl);
        // console.log(this.organizationPersonalInformation);
        //   if (data.logo) {
        //     this.setImageUrlFromDatabase(data.logo);
        // }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  // dbImageUrl: string | null = null;

  // setImageUrlFromDatabase(url: string) {
  //     this.dbImageUrl = url;
  // }

  preventLeadingWhitespace(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;

    // Prevent space if it's the first character
    if (event.key === ' ' && inputElement.value.length === 0) {
      event.preventDefault();
    }
    // if (!isNaN(Number(event.key)) && event.key !== ' ') {
    //   event.preventDefault();
    // }
  }

  preventLeadingWhitespaceAndNumber(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;

    // Prevent space if it's the first character
    if (event.key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
    if (!isNaN(Number(event.key)) && event.key !== ' ') {
      event.preventDefault();
    }
  }

  isFormInvalid: boolean = false;
  @ViewChild('personalInformationForm') personalInformationForm!: NgForm;
  checkFormValidation() {
    if (this.personalInformationForm.invalid) {
      this.isFormInvalid = true;
      return;
    } else {
      this.isFormInvalid = false;
    }
  }
  isInfoLoading: boolean = false;
  submit() {
    this.isInfoLoading = true;
    debugger;
    this.checkFormValidation();

    if (this.isFormInvalid == true) {
      this.isInfoLoading = false;
      return;
    } else {
      this.registerOrganizationPersonalInformation();

      // this._onboardingService.refreshSidebar();
    }
    // this._onboardingService.refreshOnboarding();
  }

  showNewPassword: boolean = false;
  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  selectedFile: File | null = null;
  isFileSelected = false;
  imagePreviewUrl: any = null;
  onFileSelected(event: Event): void {
    debugger;
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];

      // Check if the file type is valid
      if (this.isValidFileType(file)) {
        this.selectedFile = file;

        const reader = new FileReader();
        reader.onload = (e: any) => {
          // Set the loaded image as the preview
          // this.imagePreviewUrl = e.target.result;
        };
        reader.readAsDataURL(file);

        this.uploadFile(file);
      } else {
        element.value = '';
        this.organizationPersonalInformation.logo = '';
        // Handle invalid file type here (e.g., show an error message)
        console.error(
          'Invalid file type. Please select a jpg, jpeg, or png file.'
        );
      }
    } else {
      this.isFileSelected = false;
    }
  }

  // Helper function to check if the file type is valid
  isInvalidFileType = false;
  isValidFileType(file: File): boolean {
    const validExtensions = ['jpg', 'jpeg', 'png', 'svg'];
    const fileType = file.type.split('/').pop(); // Get the file extension from the MIME type

    if (fileType && validExtensions.includes(fileType.toLowerCase())) {
      this.isInvalidFileType = false;
      return true;
    }
    // console.log(this.isInvalidFileType);
    this.isInvalidFileType = true;
    return false;
  }

  getImageUrl(e: any) {
    // console.log(e);
    if (e != null && e.length > 0) {
    }
  }

  uploadImageLoader: boolean = false;
  uploadFile(file: File): void {
    debugger;
    this.uploadImageLoader = true;
    const filePath = `logo/${new Date().getTime()}_${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);

    task
      .snapshotChanges()
      .toPromise()
      .then(() => {
        // console.log('Upload completed');
        fileRef
          .getDownloadURL()
          .toPromise()
          .then((url) => {
            // console.log('File URL:', url);
            this.organizationPersonalInformation.logo = url;
            this.imageUrl = url;

            this.uploadImageLoader = false;
          })
          .catch((error) => {
            console.error('Failed to get download URL', error);
          });
      })
      .catch((error) => {
        console.error('Error in upload snapshotChanges:', error);
      });
  }

  @ViewChild('placesRef') placesRef!: GooglePlaceDirective;

  // public handleAddressChange(e: any) {
  //   this.organizationPersonalInformation.addressLine1 =
  //     e.formatted_address.toString();
  //   e?.address_components?.forEach((entry: any) => {
  //     console.log(entry);
  //     if (entry.types?.[0] === 'locality') {
  //       this.organizationPersonalInformation.city = entry.long_name;
  //     }
  //     if (entry.types?.[0] === 'administrative_area_level_1') {
  //       this.organizationPersonalInformation.state = entry.long_name;
  //     }
  //     if (entry.types?.[0] === 'country') {
  //       this.organizationPersonalInformation.country = entry.long_name;
  //     }
  //     if (entry.types?.[0] === 'postal_code') {
  //       this.organizationPersonalInformation.pincode = entry.long_name;
  //     }
  //   });
  // }

  /************ GET CURRENT LOCATION ***********/

fetchCurrentLocationLoader: boolean = false;
locationLoader: boolean = false;

// currentLocation() {
//   debugger;
//   this.locationLoader = true;
//   this.fetchCurrentLocationLoader = true;

//   this.getCurrentLocation()
//     .then((coords) => {
//       this.placesService
//         .getLocationDetails(coords.latitude, coords.longitude)
//         .then((details) => {
//           this.locationLoader = false;
//           this.fetchCurrentLocationLoader = false;

//           // Update only the relevant properties
//           this.organizationPersonalInformation.addressLine1 = details.formatted_address;
//           this.organizationPersonalInformation.addressLine2 = '';

//           // Dynamically retrieve address components
//           const addressComponents: AddressComponent[] = details.address_components || [];

//           addressComponents.forEach((component: AddressComponent) => {
//             const types = component.types || [];
//             if (types.includes('locality')) {
//               this.organizationPersonalInformation.city = component.long_name;
//             } else if (types.includes('administrative_area_level_1')) {
//               this.organizationPersonalInformation.state = component.long_name;
//             } else if (types.includes('country')) {
//               this.organizationPersonalInformation.country = component.long_name;
//             } else if (types.includes('postal_code')) {
//               this.organizationPersonalInformation.pincode = component.long_name;
//             }
//           });
//         })
//         .catch((error) => {
//           console.error('Error fetching location details:', error);
//           this.locationLoader = false;
//           this.fetchCurrentLocationLoader = false;
//         });
//     })
//     .catch((error) => {
//       console.error('Error fetching current location:', error);
//       this.locationLoader = false;
//       this.fetchCurrentLocationLoader = false;
//     });
// }

  // fetchCurrentLocationLoader: boolean = false;
  // locationLoader: boolean = false;
  // currentLocation() {
  //   debugger;
  //   this.locationLoader = true;
  //   this.fetchCurrentLocationLoader = true;
  //   this.getCurrentLocation()
  //     .then((coords) => {
  //       this.placesService
  //         .getLocationDetails(coords.latitude, coords.longitude)
  //         .then((details) => {
  //           this.locationLoader = false;

  //           console.log('formatted_address:', details);
  //           this.organizationPersonalInformation.addressLine1 =
  //             details.formatted_address;
  //           this.organizationPersonalInformation.addressLine2 = '';
  //           if (details.address_components[1].types[0] === 'locality') {
  //             this.organizationPersonalInformation.city =
  //               details.address_components[2].long_name;
  //           }
  //           if (
  //             details.address_components[4].types[0] ===
  //             'administrative_area_level_1'
  //           ) {
  //             this.organizationPersonalInformation.state =
  //               details.address_components[4].long_name;
  //           }
  //           if (details.address_components[5].types[0] === 'country') {
  //             this.organizationPersonalInformation.country =
  //               details.address_components[5].long_name;
  //           }
  //           if (details.address_components[6].types[0] === 'postal_code') {
  //             this.organizationPersonalInformation.pincode =
  //               details.address_components[6].long_name;
  //           }
  //           this.fetchCurrentLocationLoader = false;
  //         })
  //         .catch((error) => {
  //           console.error(error);
  //           this.fetchCurrentLocationLoader = false;
  //         });
  //       // this.fetchCurrentLocationLoader = false;
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //       this.fetchCurrentLocationLoader = false;
  //     });
  //   // this.fetchCurrentLocationLoader = false;
  // }

  getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (err) => {
            reject(err);
          }
        );
      } else {
        reject('Geolocation is not supported by this browser.');
      }
    });
  }
  /************ GET CURRENT LOCATION ***********/

  /************ CHECK EXISTANCE ***********/

  isNumberExist: boolean = false;
  checkExistance(number: string) {
    if (number != '' && number.length >= 10) {
      this._onboardingService.checkAdminNumberExist(number).subscribe(
        (response: any) => {
          this.isNumberExist = response;
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }


private debounceTimer: any;
isEmailExist: boolean = false;

checkEmailExistance(email: string) {
  if (this.debounceTimer) {
    clearTimeout(this.debounceTimer);
  }

  this.debounceTimer = setTimeout(() => {
    if (email != null && email.length > 5) {
      this._onboardingService.checkAdminEmailExist(email).subscribe((response: any) => {
        this.isEmailExist = response;
      });
    }
  }, 800); // 500ms debounce delay
}


  // isEmailExist: boolean = false;
  // checkEmailExistance(email: string) {
  //   debugger;
  //   if (email != null && email.length > 5) {
  //     this._onboardingService
  //       .checkAdminEmailExist(email)
  //       .subscribe((response: any) => {
  //         this.isEmailExist = response;
  //       });
  //   }
  // }

  /************ CHECK EXISTANCE **********/

  // ##### image upload func

  onDeleteImage(): void {
    this.organizationPersonalInformation.logo = '';
    this._onboardingService.deleteOrganizationImage().subscribe({
      next: (response) => {
        this.helperService.showToast(
          'Image Removed Successfully',
          Key.TOAST_STATUS_SUCCESS
        );
        this.getOrganizationDetails();
      },
      error: (error) => {
        this.helperService.showToast(
          'Error! Not Able To Remove Image',
          Key.TOAST_STATUS_ERROR
        );
      },
    });
  }

  //  new code Image Cropper

  @Output() imageUploadOutputList: EventEmitter<any> = new EventEmitter<any>();
  @Input() imageCategory: string = '';

  sendBulkDataToComponent() {
    this.imageUploadOutputList.emit(this.tempList);
  }

  @Input() openId!: number;
  // @ViewChild(EmptyNotificationComponent) child!: EmptyNotificationComponent;
  // responseModel: ResponseModel<Media> = new ResponseModel<Media>();
  selectedFiles!: FileList | any;
  cropedFiles!: FileList;
  // mediaMapper: MediaMapper = new MediaMapper;
  currentUpload = {
    progress: 0,
  };
  toggle = 0;
  files: any = [];
  // viewMedia!: Media;
  // media: Media = new Media;
  // localMedia!: Media[];
  // mediaList!: Media[];
  caller: string = '';
  hoveredDate!: NgbDate;
  fromDate!: NgbDate;
  toDate!: NgbDate;
  startDate: Date = new Date();
  endDate: Date = new Date();
  tagsList: any[] = new Array();
  // mediaSearch: Media = new Media();
  size!: number;
  tempList: string[] = [];
  supplierId!: string;
  imageSrc!: string;
  totalItems!: string;
  index!: number;
  tabNumber!: number;
  ids: string[] = [];
  p: number = 1;
  mediaId: string[] = [];
  tags!: string;
  noOfPages: number = 0;
  mediaManager: boolean = false;
  // mediaView: Media = new Media();
  subscription!: Subscription;
  urls: any[] = new Array();
  isHovering!: boolean;
  refreshToggle: boolean = false;
  uploadtags: any;
  interval: string = 'false';
  set: any;
  tempPage: number = 1;
  @Output() pageChanged2!: EventEmitter<number>;

  private basePath: string = '';
  readonly Constant = constant;

  aspectRatio: number = 4 / 3;
  @ViewChild('imageModel') imageModel!: ElementRef;
  @ViewChild('closeModel') closeModel!: ElementRef;
  @ViewChild('imageGallerButton') imageGallerButton!: ElementRef;
  @ViewChildren('checkboxes') checkboxes!: QueryList<ElementRef>;

  imageUrl: string = '';

  // Required
  public open(caller: any, imageUrl: string) {
    this.imageUrl = imageUrl;

    // if (caller == "profile") {
    //   this.caller = caller;
    this.tempList = new Array();
    // }
    this.isEditImage = false;
    this.isImageDeleted = false;
    this.isResetImage = false;
    this.urls = [];
    this.base64Event = false;
  }
  base64Event: boolean = false;
  imageBase64String: any;

  // Required
  toDataURL(url: any, callback: any) {
    return new Promise((res) => {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
          callback(reader.result);
          res(true);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.open('GET', url);
      xhr.responseType = 'blob';
      xhr.send();
    });
  }

  // Required
  dataURItoBlob(dataURI: any) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
  }

  imageLoadedBase64() {
    this.showCropper = true;
    // console.log("🚀 ~ file: media-manager-crop.component.ts:140 ~ MediaManagerCropComponent ~ imageLoadedBase64 ~  this.showCropper ",  this.showCropper )
    this.calculateRatio(this.previewWidth, this.previewHeight);
  }

  // Required
  enableEditField() {
    debugger;
    this.isEditImage = true;
    if (this.files.length < 1 && !this.base64Event) {
      this.onEdit();
    }
  }

  cropper = {
    x1: 100,
    y1: 100,
    x2: 200,
    y2: 200,
  };

  // Required
  async onEdit() {
    debugger;
    var src;
    this.base64Event = true;
    this.resetImageBase64String = this.imageUrl;
    await this.toDataURL(this.imageUrl, function (dataUrl: any) {
      src = dataUrl;
    });
    const imageBlob = this.dataURItoBlob(src);
    //@ts-ignore
    this.file = new File([imageBlob], this.imageNmae, { type: this.type });

    this.imageBase64String = src;

    // this.base64Event=true
    var img = new Image();

    //@ts-ignore
    img.src = src;

    var dimensions;
    //@ts-ignore
    dimensions = await this.setBase64ImageDImensions(img);

    //@ts-ignore
    this.previewHeight = dimensions[0];
    //@ts-ignore
    this.previewWidth = dimensions[1];
  }

  // Required
  setBase64ImageDImensions(img: any) {
    return new Promise((res) => {
      var imageHeight = 20;
      var imageWidth = 20;

      img.addEventListener('load', function () {
        imageHeight = img.height;
        imageWidth = img.width;

        res([imageHeight, imageWidth]);
      });
    });
  }

  // Required
  closeCropperModel() {
    this.closeModel.nativeElement.click();
    this.base64Event = false;
    this.imageBase64String = null;
    this.imageChangedEvent = null;
    this.interval = 'false';
    this.files = new Array();
    this.urls = new Array();
    this.canvasRotation = 0;
    this.transform = {};
  }

  clearLocal() {
    localStorage.removeItem('Uploaded');
    localStorage.removeItem('imageLength');
    this.interval = 'false';
    this.files = [];
    this.urls = [];
    localStorage.removeItem('uploadTags');
  }

  imageChangedEvent: any = '';
  croppedImage: any = '';
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  showCropper = false;
  containWithinAspectRatio = true;

  type: string = '';
  uploadFileName: string = '';
  imageNmae: string = '';
  isLoading: boolean = false;
  // Required
  onSelectFile(event: any) {
    debugger;
    this.isLoading = true;
    this.isImageDeleted = false;
    this.imageChangedEvent = event;
    this.resetImageChangedEvent = event;
    this.selectedFiles = event.target.files;
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;

      this.imageNmae = event.target.files[0].name;
      this.uploadFileName = this.imageNmae;
      this.type = event.target.files[0].type;

      for (let i = 0; i < filesAmount; i++) {
        const element = event.target.files[i];
        this.file = event.target.files[i];
        this.files.push(element.name);
        var reader = new FileReader();

        reader.onload = (event: any) => {
          this.urls.push(event.target.result);
        };
        reader.readAsDataURL(event.target.files[i]);
      }
    }
  }

  // Required
  file: any;
  previewWidth!: number;
  previewHeight!: number;
  // async imageCropped(event: any) {
  //   debugger;
  //   this.croppedImage = event.base64;
  //   console.log(
  //     '🚀 ~ file: media-manager-crop.component.ts:294 ~ MediaManagerCropComponent ~ imageCropped ~ event.base64',
  //     event.base64,
  //   );
  //   let blob = this.base64ToFile(this.croppedImage);
  //   this.file = new File([blob], this.imageNmae, { type: this.type });
  // }

  async imageCroppedBase64(event: any) {
    debugger;
    this.croppedImage = event.base64;
    let blob = this.dataURItoBlob(this.croppedImage);

    this.file = new File([blob], this.imageNmae, { type: this.type });

    var img = new Image();

    //@ts-ignore
    img.src = this.croppedImage;
    var dimensions;
    //@ts-ignore
    dimensions = await this.setBase64ImageDImensions(img);

    //@ts-ignore
    this.previewHeight = dimensions[0];
    //@ts-ignore
    this.previewWidth = dimensions[1];
  }

  // Required
  transform: ImageTransform = {
    translateUnit: 'px',
  };
  zoomOut() {
    this.scale -= 0.1;
    this.transform = {
      ...this.transform,
      scale: this.scale,
    };
  }
  // Required
  zoomIn() {
    debugger;
    this.scale += 0.1;
    this.transform = {
      ...this.transform,
      scale: this.scale,
    };
  }

  // Required
  base64ToFile(base64Image: any): Blob {
    const split = base64Image.split(',');
    const type = split[0].replace('data:', '').replace(';base64', '');
    this.type = type;
    const byteString = atob(split[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i += 1) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type });
  }

  // Required
  // imageLoaded(event: any) {
  //   debugger;
  //   this.showCropper = true;

  //   this.previewHeight = event.original.size.height;
  //   this.previewWidth = event.original.size.width;
  //   console.log(
  //     '🚀 ~ file: media-manager-crop.component.ts:374 ~ MediaManagerCropComponent ~ imageLoaded ~  this.previewWidth',
  //     this.previewWidth,
  //   );
  //   this.isLoading = false;
  //   this.calculateRatio(this.previewWidth, this.previewHeight);
  // }

  // cropperReady() {
  //   console.log('Cropper ready');
  // }

  loadImageFailed() {
    console.log('Load failed');
  }

  // Required
  mediaUrl: string = '';
  // async uploadSingle() {
  //   debugger;
  //   if (this.isImageDeleted) {
  //     this.tempList = new Array();
  //     this.imageModel.nativeElement.click();
  //     this.sendBulkDataToComponent();
  //     return;
  //   }
  //   this.cropedFiles = this.file;
  //   console.log(this.cropedFiles);
  //   // console.log(this.cropedFiles[0].);
  //   var mediaUploaded = await this.uploadSingleMediaToFireBaseAndGetUrl(
  //     this.cropedFiles,
  //     this.imageNmae,
  //   );

  //   if (mediaUploaded) {
  //     this.imageModel.nativeElement.click();
  //     this.currentUpload.progress = this.progress;
  //     this.checkUploaded();
  //     this.resetAllImages();
  //   }
  // }

  // async uploadBase64Single() {
  //   var file = new File([this.imageBase64String], this.imageNmae, {
  //     type: this.type,
  //   });
  //   var mediaUploaded = await this.uploadSingleMediaToFireBaseAndGetUrl(
  //     file,
  //     this.imageNmae,
  //   );

  //   if (mediaUploaded) {
  //     this.imageModel.nativeElement.click();
  //     this.currentUpload.progress = this.progress;
  //     this.checkUploaded();
  //     this.resetAllImages();
  //   }
  // }

  async uploadSingle() {
    if (this.isImageDeleted) {
      this.tempList = [];
      this.imageModel.nativeElement.click();
      this.sendBulkDataToComponent();
      return;
    }

    if (!this.croppedImage) {
      console.error('No image cropped.');
      return;
    }

    this.loading = true;

    try {
      // Extract the actual blob URL from the SafeUrl object
      const unsafeUrl =
        this.croppedImage.changingThisBreaksApplicationSecurity ||
        this.croppedImage;

      const response = await fetch(unsafeUrl);
      const blob = await response.blob();

      const fileName = `uploaded_${new Date().getTime()}.png`;
      const mediaUploaded = await this.uploadSingleMediaToFireBaseAndGetUrl(
        blob,
        fileName
      );

      if (mediaUploaded) {
        this.imageModel.nativeElement.click();
        this.currentUpload.progress = this.progress;
        this.checkUploaded();
        this.resetAllImages();
      } else {
        console.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error fetching the blob:', error);
    } finally {
      this.loading = false;
    }
  }

  checkUploaded() {
    debugger;

    if (this.interval) {
      localStorage.removeItem('Uploaded');
      this.currentUpload.progress = 0;
      this.progress = 0;
      clearInterval(this.set);
      this.sendBulkDataToComponent();

      if (this.closeModel) {
        this.closeModel.nativeElement.click();
      }
    }
  }

  closePopupModel() {
    if (this.closeModel) {
      this.closeModel.nativeElement.click();
    }
  }

  resetImageChangedEvent: any;
  resetImageBase64String: any;
  isEditImage: boolean = false;
  isResetImage: boolean = false;
  isImageDeleted: boolean = false;

  // Required
  resetAllImages() {
    this.isLoading = false;
    this.imageChangedEvent = '';
    this.imageBase64String = '';
    this.base64Event = false;
    this.interval = 'false';
    this.files = new Array();
    this.urls = new Array();
    this.isEditImage = false;

    if (this.isResetImage) {
      this.isResetImage = false;

      if (this.base64Event) {
        this.imageUrl = this.resetImageBase64String;
        this.onEdit();
      } else {
        this.onSelectFile(this.resetImageChangedEvent);
        this.isLoading = false;
        // this.isLoading = false;
      }
    }
  }

  deleteProfileImage() {
    this.imageChangedEvent = '';
    this.imageBase64String = '';
    this.base64Event = false;
    this.interval = 'false';
    this.files = new Array();
    this.urls = new Array();
    this.imageUrl = '';
    this.isImageDeleted = true;
  }

  tempProgress: any = 0;
  progress: number = 0;
  curretntCount: number = 0;
  toggleUpload: boolean = false;
  // constantExtension: ConstantExtension = new ConstantExtension();
  async uploadSingleMediaToFireBaseAndGetUrl(file: any, fileName: any) {
    debugger;
    return new Promise((resolve: any, reject) => {
      this.toggleUpload = true;
      const filePath = `uploads/${new Date().getTime()}_${fileName}`;
      // const fileRef = this.storage.ref(this.basePath +  "/" + this.imageCategory + "/" + fileName);
      const fileRef = this.afStorage.ref(filePath);
      const task = this.afStorage.upload(filePath, file);
      task
        .snapshotChanges()
        .pipe(
          finalize(async () => {
            fileRef.getDownloadURL().subscribe((url) => {
              // console.log(url);
              this.organizationPersonalInformation.logo = url;
              this.imageUrl = url;
              this.imagePreviewUrl = url;
              // this.media.mediaUrl = url;
              // this.mediaUrl = this.media.mediaUrl;
              // this.media.mediaName = fileName;
              // this.media.name = fileName;
              // this.media.aspectRatio=this.aspectRatio;

              this.tempList = [];
              this.tempList.push(url);
              this.toggleUpload = false;
              resolve(true);
            });
          })
        )
        .subscribe((res) => {
          if (res != null) {
            if ((res.bytesTransferred / res.totalBytes) * 100 == 100) {
              this.tempProgress = this.tempProgress + res;
            }
            if (
              (res.bytesTransferred / res.totalBytes) * 100 < 100 &&
              (res.bytesTransferred / res.totalBytes) * 100 > this.progress
            ) {
              this.progress = (res.bytesTransferred / res.totalBytes) * 100;
            }
            if (this.tempProgress == this.curretntCount * 100) {
              this.progress = this.tempProgress;
            }
          }
        });
      // resolve (true);
    });
  }

  calculateRatio(num_1: any, num_2: any) {
    this.aspectRatio = num_1 / num_2;
    // console.log(
    //   '🚀 ~ file: media-manager-crop.component.ts:548 ~ MediaManagerCropComponent ~ calculateRatio ~  this.aspectRatio:',
    //   this.aspectRatio
    // );
    return this.aspectRatio;
  }

  // Required
  rotateLeft() {
    this.canvasRotation--;
  }

  // Required
  rotateRight() {
    this.canvasRotation++;
  }

  @ViewChild('tempDiv') tempDiv!: ElementRef;
  @ViewChild('closeinfo') closeinfo!: ElementRef;

  // closeinfo
  addClass() {
    this.showHelpInstructions = true;
    if (this.tempDiv.nativeElement.classList.contains('imageinstrshow')) {
      this.closeinfo.nativeElement.classList.remove('showimgbox');
      this.tempDiv.nativeElement.classList.remove('imageinstrshow');
    } else {
      this.closeinfo.nativeElement.classList.add('showimgbox');
      this.tempDiv.nativeElement.classList.add('imageinstrshow');
    }
  }

  showHelpInstructions: boolean = true; // Controls the visibility of the help instructions
  closeHelpInstructions() {
    this.showHelpInstructions = false; // Hides the help instructions
  }

  //Image cropper Events function------>
  translateH = 0;
  translateV = 0;
  imageURL?: string;
  // loading = false;
  allowMoveImage = false;
  hidden = false;

  fileChangeEvent(event: any): void {
    this.loading = true;
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    debugger;
    this.isLoading = false;
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(
      event.objectUrl || event.base64 || ''
    );
    // console.log(event);
  }

  imageLoaded() {
    this.showCropper = true;
    this.isLoading = false;
    // console.log('Image loaded');
  }

  cropperReady(sourceImageDimensions: Dimensions) {
    // console.log('imageLoadedCropper ready', sourceImageDimensions);
    this.loading = false;
  }

  // loadImageFailed() {
  //   console.error('Load image failed');
  // }

  // rotateLeft() {
  //   this.loading = true;
  //   setTimeout(() => {
  //     // Use timeout because rotating image is a heavy operation and will block the ui thread
  //     this.canvasRotation--;
  //     this.flipAfterRotate();
  //   });
  // }

  // rotateRight() {
  //   this.loading = true;
  //   setTimeout(() => {
  //     this.canvasRotation++;
  //     this.flipAfterRotate();
  //   });
  // }

  moveLeft() {
    this.transform = {
      ...this.transform,
      translateH: ++this.translateH,
    };
  }

  moveRight() {
    this.transform = {
      ...this.transform,
      translateH: --this.translateH,
    };
  }

  moveTop() {
    this.transform = {
      ...this.transform,
      translateV: ++this.translateV,
    };
  }

  moveBottom() {
    this.transform = {
      ...this.transform,
      translateV: --this.translateV,
    };
  }

  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH,
    };
    this.translateH = 0;
    this.translateV = 0;
  }

  flipHorizontal() {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH,
    };
  }

  flipVertical() {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV,
    };
  }

  resetImage() {
    this.scale = 1;
    this.rotation = 0;
    this.canvasRotation = 0;
    this.transform = {
      translateUnit: 'px',
    };
  }

  // zoomOut() {
  //   this.scale -= 0.1;
  //   this.transform = {
  //     ...this.transform,
  //     scale: this.scale,
  //   };
  // }

  // zoomIn() {
  //   this.scale += 0.1;
  //   this.transform = {
  //     ...this.transform,
  //     scale: this.scale,
  //   };
  // }

  toggleContainWithinAspectRatio() {
    this.containWithinAspectRatio = !this.containWithinAspectRatio;
  }

  updateRotation() {
    this.transform = {
      ...this.transform,
      rotate: this.rotation,
    };
  }

  toggleAspectRatio() {
    this.aspectRatio = this.aspectRatio === 4 / 3 ? 16 / 5 : 4 / 3;
  }
}
