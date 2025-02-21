import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { WebcamImage, WebcamUtil } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Key } from 'src/app/constant/key';
import { EmployeeAttendanceLocation } from 'src/app/models/employee-attendance-location';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-employee-attendance-photo',
  templateUrl: './employee-attendance-photo.component.html',
  styleUrls: ['./employee-attendance-photo.component.css'],
})
export class EmployeeAttendancePhotoComponent implements OnInit {
  private trigger: Subject<any> = new Subject();

  public webcamImage!: WebcamImage;
  private nextWebcam: Subject<any> = new Subject();
  employeeAttendanceLocation: EmployeeAttendanceLocation =
    new EmployeeAttendanceLocation();
  captureImage = '';

  constructor(
    private dataService: DataService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private helper: HelperService,
    private afStorage: AngularFireStorage
  ) {}

  ngOnInit(): void {
    window.scroll(0, 0);
    this.missingLatLng();
  }

  routeToLocationValidator() {
    let navExtra: NavigationExtras = {
      queryParams: {
        userUuid: new URLSearchParams(window.location.search).get('userUuid'),
      },
    };
    this.router.navigate(['/location-validator'], navExtra);
  }

  submitButton: boolean = false;
  disableButton : boolean = false;
  toggle = false;
  markAttendaceWithLocationMethodCall() {
    // this.getCurrentLocation();
    debugger;
    this.toggle = true;
    // this.uploadFile(this.imageFile, 'webcamImage');
    this.missingLatLng();
    const userUuid =
      new URLSearchParams(window.location.search).get('userUuid') || '';
    this.employeeAttendanceLocation.latitude = this.dataService.lat.toString();
    this.employeeAttendanceLocation.longitude = this.dataService.lng.toString();
    this.employeeAttendanceLocation.distance = this.dataService.radius;
    this.employeeAttendanceLocation.currentLocation = this.dataService.address;

    this.dataService
      .markAttendaceWithLocation(this.employeeAttendanceLocation, userUuid)
      .subscribe(
        (response: EmployeeAttendanceLocation) => {
          this.disableButton = true;
          // console.log(response);
          this.toggle = false;
          if (response.status == 'Already Checked In') {
            this.helper.showToast(
              "You're Already Checked In",
              Key.TOAST_STATUS_ERROR
            );
          }

          if (response.status == 'In') {
            this.dataService.lat = 0;
            this.dataService.lng = 0;
            this.helper.showToast(
              "You're Successfully Checked In",
              Key.TOAST_STATUS_SUCCESS
            );
            this.toggle = true;
            
          }

          if (response.status == 'Out') {
            this.helper.showToast(
              "You've Successfully Checked Out",
              Key.TOAST_STATUS_SUCCESS
            );
            
            this.toggle = true;
          }

          if(response.onboardingVia == 'SLACK') {
            this.helper.showToast(
              response.status,
              Key.TOAST_STATUS_SUCCESS
            );
            this.toggle = true;
          }

          if(response.onboardingVia == 'WHATSAPP') {
            window.location.href =
              'https://api.whatsapp.com/send/?phone=918700822872&type=phone_number&app_absent=0';
            } else if(response.onboardingVia == 'SLACK'){
              window.location.href = Key.SLACK_WORKSPACE_URL;
            }
          this.toggle = false;
        },
        (error) => {
          this.disableButton = true;
          console.error(error);
        }
      );
  }

  public triggerSnapshot(): void {
    this.toggle = true;
    this.trigger.next();
  }

  public get triggerObservable(): Observable<any> {
    return this.trigger.asObservable();
  }

  isShimmer: boolean = true;
  public get nextWebcamObservable(): Observable<any> {
    return this.nextWebcam.asObservable();
  }

  dataURLtoBlob(dataurl: string) {
    const arr = dataurl.split(',');
    const match = arr[0].match(/:(.*?);/);

    if (match) {
      const mime = match[1];

      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } else {
      throw new Error('Invalid data URL');
    }
  }

  imageFile: any;
  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.captureImage = webcamImage.imageAsDataUrl;
    console.info('received webcam image', this.captureImage);

    // Convert Data URL to Blob
    const imageBlob = this.dataURLtoBlob(this.captureImage);

    // Create a file from Blob
    this.imageFile = new File([imageBlob], 'captured_image.png', {
      type: 'image/png',
    });
    // console.log(this.imageFile);
    // Upload file to Firebase
    this.uploadFile(this.imageFile, 'webcamImage');
  }

  uploadFile(imageFile: File, documentType: string): void {
    debugger;
    const filePath = `documents/${new Date().getTime()}_${imageFile.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, imageFile);

    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(
            (url) => {
              this.toggle = false;
              // console.log(url);
              this.employeeAttendanceLocation.imageUrl = url;
              this.submitButton = true;
            },
            (error) => {
              console.error('Error getting download URL:', error);
            }
          );
        })
      )
      .subscribe(
        () => {
          console.log('Upload snapshotChanges observable received an event');
        },
        (error) => {
          console.error('Error during file upload:', error);
        }
      );
  }

  missingLatLng() {
    debugger;
    if (this.dataService.lat == 0 && this.dataService.lng == 0) {
      this.helper.showToast(
        'Please Fetch Your Current Location Again!',
        Key.TOAST_STATUS_ERROR
      );
      setTimeout((x) => {
        let navExtra: NavigationExtras = {
          queryParams: {
            userUuid: new URLSearchParams(window.location.search).get(
              'userUuid'
            ),
          },
        };
        this.router.navigate(['/location-validator'], navExtra);
      }, 2000);
    } else {
      return;
    }
  }

  clickAgain() {
    this.disableButton = false;
    this.employeeAttendanceLocation.imageUrl = '';
    this.submitButton = false;
    this.captureImage = '';
  }

  public devices: MediaDeviceInfo[] = [];
  public currentDeviceId: string | undefined;

  public getAvailableCameras(): void {
    WebcamUtil.getAvailableVideoInputs().then((devices: MediaDeviceInfo[]) => {
      this.devices = devices;

      // Attempt to set the front camera as default
      // This code assumes device labels are available and contain "front" for the front camera.
      // Adjust based on actual device label characteristics or use facingMode constraints if available.
      const frontCamera = devices.find((device) =>
        device.label.toLowerCase().includes('front')
      );
      if (frontCamera) {
        this.currentDeviceId = frontCamera.deviceId;
      }
    });
  }
}
