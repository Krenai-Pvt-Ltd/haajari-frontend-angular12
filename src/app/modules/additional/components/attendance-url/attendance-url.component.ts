import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { WebcamImage, WebcamUtil} from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { Key } from 'src/app/constant/key';
import { EmployeeAttendanceLocation } from 'src/app/models/employee-attendance-location';
import { OrganizationAddressDetail } from 'src/app/models/organization-address-detail';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
declare var google: any;

@Component({
  selector: 'app-attendance-url',
  templateUrl: './attendance-url.component.html',
  styleUrls: ['./attendance-url.component.css']
})
export class AttendanceUrlComponent implements OnInit {

  @Input() data: any;

    employeeAttendanceLocation: EmployeeAttendanceLocation =
      new EmployeeAttendanceLocation();
    organizationAddressDetail: OrganizationAddressDetail =
      new OrganizationAddressDetail();
    lat: number = 0;
    lng: number = 0;
    zoom: number = 15; // Initial zoom level of the map
    markerPosition: any;
    attendanceMode: number = 0;
  
    constructor(
      private dataService: DataService,
      private router: Router,
      private helper: HelperService,
      private afStorage: AngularFireStorage
    ) {}
  
    ngOnInit(): void {
      debugger
  
      window.scroll(0, 0);
      this.getFlexibleAttendanceMode()
      this.checkAttendanceLocationLinkStatusMethodCall();

      // let navExtra: NavigationExtras = {
      //   queryParams: { userUuid: userUuid },
      // };
      // this.router.navigate(['/location-validator'], navExtra);
      // this.getFlexibleAttendanceMode();
    }
  
  
    locateUser(){
      navigator.permissions.query({ name: 'geolocation' })
      .then( (PermissionStatus) => {
        if (PermissionStatus.state == 'granted') {
          if (Key.GEOLOCATION in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
              this.disableButton = false;
              this.lat = position.coords.latitude;
              this.lng = position.coords.longitude;
              this.accuracy=position.coords.accuracy;
              this.getCurrentLocation();
            },
            (error) => {
              
            },
            {
              enableHighAccuracy: true,  // Precise location
            maximumAge: 0              // Prevent cached locations
            }
            );
          }
        } else {  
          this.requestPermission();
        } 
      
      });
  
    }
  
    accuracy:number=5;
    requestPermission(){
      window.alert('To enable Location Services and allow the site to determine your location, click the location icon in the address bar and select "Always allow.');  
      if (Key.GEOLOCATION in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.lat = position.coords.latitude;
            this.lng = position.coords.longitude;
            this.accuracy=position.coords.accuracy;
            // console.log("🚀 ~ EmployeeLocationValidatorComponent ~ requestPermission ~ this.accuracy:", this.accuracy)
            this.getCurrentLocation();
            // console.log('Geolocation obtained after prompting:', position);
          },
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
            //  this.requestPermission();
            navigator.permissions.query({name:'geolocation'})
              console.error('User denied the request for Geolocation.');
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              console.error('Location information is unavailable.');
            } else if (error.code === error.TIMEOUT) {
              console.error('The request to get user location timed out.');
            } else {
              console.error('An unknown error occurred.');
            }
          },
          {
            enableHighAccuracy: true,  // Precise location
            maximumAge: 0              // Prevent cached locations
          }
        );
      }else{
       window.alert("Geolocation is not supported by this browser.");
      }
    }
  
  
    enableSubmitToggle: boolean = false;
    address: string = ''; // Add this property to hold the fetched address
    city: string = '';
    getCurrentLocation() {
      debugger;
      if (this.address != '') {
        this.address = '';
      }
          this.markerPosition = { lat: this.lat, lng: this.lng };
  
          // Initialize the Geocoder
          const geocoder = new google.maps.Geocoder();
          const latlng = { lat: this.lat, lng: this.lng };
          // console.log(latlng); 
          geocoder.geocode(
            { location: latlng },
            (results: { formatted_address: string }[], status: string) => {
              if (status === google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                  const address = results[0].formatted_address;
                  //@ts-ignore
                  this.city = results[0].address_components[2].long_name;
                  this.address = address;
                  this.employeeAttendanceLocation.currentLocation = address;
                  // console.log(address); // Log the address to console or update the UI as needed
                  this.enableSubmitToggle = true;
                  (
                    document.getElementById(
                      'exampleInputText'
                    ) as HTMLInputElement
                  ).value = address; // Update the input field with address
                } else {
                  console.log('No results found');
                }
              } else {
                console.log('Geocoder failed due to: ' + status);
              }
            }
          );
        
     
    }
    isSelfieNeeded: boolean = false;
    routeToEmployeePhoto() {
      this.isSelfieNeeded=true;
      this.missingLatLng();
      this.clickAgain();
    }
  
    disableButton: boolean = false;
    calculateDistance() {
      // console.log("calculate distance called",this.organizationAddressDetails)
      debugger
      this.enableSubmitToggle = false;
  
      this.disableButton = true;
      const userLatLng = new google.maps.LatLng(this.lat, this.lng);
      let isWithinAnyLocation = false;
  
      for (const addressDetail of this.organizationAddressDetails) {
          const organizationLatLng = new google.maps.LatLng(Number(addressDetail.latitude), Number(addressDetail.longitude));
          var distance = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, organizationLatLng);
          // window.alert("radius"+addressDetail.radius)
  
          if(this.accuracy>0){
            addressDetail.radius=String(+addressDetail.radius+this.accuracy);
          // window.alert("🚀 ~ EmployeeLocationValidatorComponent ~ calculateDistance ~ distance=distance+this.accuracy;: AFTER"+ (addressDetail.radius+(this.accuracy)))
          }
          // window.alert(usee)
  
          // window.alert(distance + '---' + addressDetail.radius);
          if (distance <= addressDetail.radius && !this.isFlexible) {
              isWithinAnyLocation = true;
              this.attendanceMode = addressDetail.attendanceMode;
              break;
          }else if(this.isFlexible) {
              isWithinAnyLocation = true;
              this.attendanceMode = addressDetail.attendanceMode;
              break;
          }
      }
  
      if (!isWithinAnyLocation) {
          this.helper.showToast(
              "Oops! Looks like you're not close enough to the company to mark your attendance. Please try again when you're nearby!",
              Key.TOAST_STATUS_ERROR
          );
          // console.log('Cannot mark attendance');
      } else {
          if (this.attendanceMode == 3) {
              this.dataService.saveEmployeeCurrentLocationLatLng(this.lat, this.lng, this.radius, this.attendanceMode, this.address);
              this.routeToEmployeePhoto();
          } else if (this.attendanceMode == 2) {
              this.markAttendaceWithLocationMethodCall();
          }
      }
  }
  
  isFlexible: boolean = false;
  getFlexibleAttendanceMode() {
    const userUuid =this.data.uuid;
    console.log('uuuuid', userUuid)
    if(userUuid) {
    this.dataService.getFlexibleAttendanceModeByUserUuid(userUuid).subscribe((response) => {
       this.isFlexible = response.object;
    },(error) =>{
       console.log(error);
    })
    }
  }
  
  
  
    radius: string = '';
    organizationLat: string | undefined;
    OrganizationLong: string | undefined;
    organizationAddressDetails: OrganizationAddressDetail[] = [];
    getOrganizationLatLongMethodCall() {
      const userUuid = this.data.uuid;
      if (userUuid) {
          this.dataService.getOrganizationLatLong(userUuid).subscribe(
              (response: OrganizationAddressDetail[]) => {
                  if (response && response.length > 0) {
                      this.organizationAddressDetails = response;
                      // console.log("API RESPONSE", this.organizationAddressDetails[0].radius)
  
                      // console.log(response);
                  } else {
                      console.log('No address details found');
                  }
              },
              (error: any) => {
                  console.error('Error fetching address details:', error);
              }
          );
      } else {
          console.error('userUuid not found');
      }
  }
  
  
  
    toggle = false;
    @ViewChild('closeAttendanceButton', { static: true }) closeButton!: ElementRef<HTMLButtonElement>;

    button = document.getElementById('closeAttendanceButton');

    markAttendaceWithLocationMethodCall() {
      this.toggle=true;
      const userUuid = this.data.uuid || '';
      this.employeeAttendanceLocation.latitude = this.lat.toString();
      this.employeeAttendanceLocation.longitude = this.lng.toString();
      this.employeeAttendanceLocation.distance = this.radius;
  
      this.dataService
        .markAttendaceWithLocation(this.employeeAttendanceLocation, userUuid)
        .subscribe(
          (response: EmployeeAttendanceLocation) => {
            // console.log(response);
            if (this.button) {
              this.button.click(); // Trigger the click event
            }
            this.enableSubmitToggle = true;
            if (response.status == 'Already Checked In') {
              this.helper.showToast(
                "You're Already Checked In",
                Key.TOAST_STATUS_ERROR
              );
            }
  
            if (response.status == 'In') {
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
  
            if(response.onboardingVia == 'WHATSAPP' || !response.onboardingVia || response.onboardingVia== null ) {
              window.location.href =
                'https://api.whatsapp.com/send/?phone=918700822872&type=phone_number&app_absent=0';
              } else if(response.onboardingVia == 'SLACK'){
                window.location.href = Key.SLACK_WORKSPACE_URL;
              }
            this.helper.closeModal();
            this.toggle = false;
          },
          (error) => {
            if (this.button) {
              this.button.click(); // Trigger the click event
            }
            console.error(error);
          }
        );
    }
    
  

  
    isInvalid: boolean = false;
    checkAttendanceLocationLinkStatusMethodCall() {
      debugger
      const uniqueId = this.data.uniqueId;
      console.log('unique ' , uniqueId);
      if (uniqueId) {
        this.dataService.checkAttendanceLocationLinkStatus(uniqueId).subscribe({
          next: (response) => {
            this.getOrganizationLatLongMethodCall();
            // this.getCurrentLocation();
            this.locateUser();
            console.log('Link status:', response);
          },
          error: (error) => {
            this.isInvalid = true;
            console.error('Error fetching link status:', error);
          },
        });
      } else {
        this.isInvalid = true;
        console.error('No uniqueId found in the URL');
      }
    }


    // selfie 

     private trigger: Subject<any> = new Subject();
    
      public webcamImage!: WebcamImage;
      private nextWebcam: Subject<any> = new Subject();
      captureImage = '';

  
        

    
      routeToLocationValidator() {
        let navExtra: NavigationExtras = {
          queryParams: {
            userUuid: new URLSearchParams(window.location.search).get('userUuid'),
          },
        };
        this.router.navigate(['/location-validator'], navExtra);
      }
    
      submitButton: boolean = false;
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