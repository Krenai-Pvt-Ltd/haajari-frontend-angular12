import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import * as _ from 'lodash';
// import { ResponseModel } from 'src/app/models/Response-Model';
// import { MediaMapper } from 'src/app/models/MediaMapper';
// import { Media } from 'src/app/models/Media';
// import { EmptyNotificationComponent } from '../empty-notification/empty-notification.component';
// import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
// import { ImageTransform } from 'ngx-image-cropper';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { constant } from 'src/app/constant/constant';
import { OrganizationPersonalInformationComponent } from '../../authentication/components/organization-personal-information/organization-personal-information.component';
// import { Constant } from 'src/app/constants/Constants';
// import { SharedService } from 'src/app/services/data-sharing/shared.service';
// import { AuthenticationService } from 'src/app/services/-authentication.service';
// import { ConstantExtension } from 'src/app/constants/ConstantExtension';
// import { UploadService } from 'src/app/services/image-upload-service';

@Component({
  selector: 'media-manager-crop',
  templateUrl: './media-manager-crop.component.html',
  styleUrls: ['./media-manager-crop.component.css'],
})
export class MediaManagerCropComponent implements OnInit {
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
  constructor(
    public formatter: NgbDateParserFormatter,
    private storage: AngularFireStorage,
    private organizationPersonalInformationComponent: OrganizationPersonalInformationComponent,
    // private _sharedService:SharedService,
    // public _authService:AuthenticationService,
    // private _imageService:UploadService
  ) {
    // if(!this.Constant.EMPTY_STRINGS.includes(_sharedService.store.domain)){
    //   this.basePath = _sharedService.store.domain;
    // }else{
    //   this.basePath = _sharedService.store.uuid;
    // }
  }
  @ViewChild('imageModel') imageModel!: ElementRef;
  @ViewChild('closeModel') closeModel!: ElementRef;
  @ViewChild('imageGallerButton') imageGallerButton!: ElementRef;
  @ViewChildren('checkboxes') checkboxes!: QueryList<ElementRef>;

  ngOnInit() {
    // this.media.databaseHelper = new DatabaseHelper();
  }

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

  // Required
  onSelectFile(event: any) {
    debugger;

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
  async imageCropped(event: any) {
    debugger;
    this.croppedImage = event.base64;
    console.log(
      '🚀 ~ file: media-manager-crop.component.ts:294 ~ MediaManagerCropComponent ~ imageCropped ~ event.base64',
      event.base64,
    );
    let blob = this.base64ToFile(this.croppedImage);
    this.file = new File([blob], this.imageNmae, { type: this.type });
  }

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
  transform: any = {};
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
  imageLoaded(event: any) {
    debugger;
    this.showCropper = true;

    this.previewHeight = event.original.size.height;
    this.previewWidth = event.original.size.width;
    console.log(
      '🚀 ~ file: media-manager-crop.component.ts:374 ~ MediaManagerCropComponent ~ imageLoaded ~  this.previewWidth',
      this.previewWidth,
    );
    this.calculateRatio(this.previewWidth, this.previewHeight);
  }

  cropperReady() {
    // console.log('Cropper ready');
  }

  loadImageFailed() {
    // console.log('Load failed');
  }

  // Required
  mediaUrl: string = '';
  async uploadSingle() {
    if (this.isImageDeleted) {
      this.tempList = new Array();
      this.imageModel.nativeElement.click();
      this.sendBulkDataToComponent();
      return;
    }
    this.cropedFiles = this.file;
    // console.log(this.cropedFiles);
    // console.log(this.cropedFiles[0].);
    var mediaUploaded = await this.uploadSingleMediaToFireBaseAndGetUrl(
      this.cropedFiles,
      this.imageNmae,
    );

    if (mediaUploaded) {
      this.imageModel.nativeElement.click();
      this.currentUpload.progress = this.progress;
      this.checkUploaded();
      this.resetAllImages();
    }
  }

  async uploadBase64Single() {
    var file = new File([this.imageBase64String], this.imageNmae, {
      type: this.type,
    });
    var mediaUploaded = await this.uploadSingleMediaToFireBaseAndGetUrl(
      file,
      this.imageNmae,
    );

    if (mediaUploaded) {
      this.imageModel.nativeElement.click();
      this.currentUpload.progress = this.progress;
      this.checkUploaded();
      this.resetAllImages();
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
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);
      task
        .snapshotChanges()
        .pipe(
          finalize(async () => {
            fileRef.getDownloadURL().subscribe((url) => {
              // console.log(url);
              this.organizationPersonalInformationComponent.organizationPersonalInformation.logo =
                url;
              this.organizationPersonalInformationComponent.imagePreviewUrl =
                url;
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
          }),
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
    console.log(
      '🚀 ~ file: media-manager-crop.component.ts:548 ~ MediaManagerCropComponent ~ calculateRatio ~  this.aspectRatio:',
      this.aspectRatio,
    );
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
    if (this.tempDiv.nativeElement.classList.contains('imageinstrshow')) {
      this.closeinfo.nativeElement.classList.remove('showimgbox');
      this.tempDiv.nativeElement.classList.remove('imageinstrshow');
    } else {
      this.closeinfo.nativeElement.classList.add('showimgbox');
      this.tempDiv.nativeElement.classList.add('imageinstrshow');
    }
  }
}
