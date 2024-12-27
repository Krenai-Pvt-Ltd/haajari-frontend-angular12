import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { constant } from 'src/app/constant/constant';
import { Key } from 'src/app/constant/key';
import { AttendanceMode } from 'src/app/models/attendance-mode';
import { OrganizationAddressDetail } from 'src/app/models/organization-address-detail';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';
import { PlacesService } from 'src/app/services/places.service';
import { SubscriptionPlanService } from 'src/app/services/subscription-plan.service';

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}
@Component({
  selector: 'app-attendance-mode',
  templateUrl: './attendance-mode.component.html',
  styleUrls: ['./attendance-mode.component.css'],
})
export class AttendanceModeComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private helperService: HelperService,
    private router: Router,
    private onboardingService: OrganizationOnboardingService,
    private _location: Location,
    private placesService: PlacesService,
    private _subscriptionService: SubscriptionPlanService
  ) {}


  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token == null) {
      this.router.navigate(['/auth/signup']);
    }
    this.getAttendanceModeAllMethodCall();
    this.getAttendanceModeMethodCall();
    this.getOrganizationAddressDetailMethodCall();
    this.getMasterAttendanceModeMethodCall();
    this.getAttendanceModeStep();
    // this.getFlexibleAttendanceMode();
  }

  routeToBilling() {
    this.router.navigate(['/billing-and-subscription']);
  }

  isUpdate: boolean = false;
  currentAttendanceModeId: number = 0;
  isAttendanceModeSelected: boolean = false;

  updateAttendanceMode(attendanceModeId: number) {
    debugger
    if (attendanceModeId == Key.MANUAL_ATTENDANCE) {
      this.updateAttendanceModeMethodCall(attendanceModeId);
      this.saveAttendaceFlexibleModeInfo('flexible');
    } else {
      this.updateAttendanceModeMethodCall(attendanceModeId);
      // this.scrollToView();
      // this.getFlexibleAttendanceMode();
      // this.updateMasterAttendanceModeMethodCall(1, 3);
      // this.attendanceWithLocationButton.nativeElement.click();
      this.saveAttendaceFlexibleModeInfo('flexible');
      this.currentAttendanceModeId = attendanceModeId;
      this.currentLocation();
    }
  }

  @ViewChild('attendanceWithLocationButton')
  attendanceWithLocationButton!: ElementRef;
  updateAttendanceModeMethodCall(attendanceModeId: number) {
    this.dataService.updateAttendanceMode(attendanceModeId).subscribe(
      (response) => {
        this.getAttendanceModeMethodCall();
        // setTimeout(() => {
        //   this.helperService.showToast(
        //     'Attedance Mode updated successfully.',
        //     Key.TOAST_STATUS_SUCCESS
        //   );
        // }, 1000);
      },
      (error) => {
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
      }
    );
  }

  // modeStepId: number = 0;
  updateMasterAttendanceModeMethodCall(attendanceMasterModeId: number, modeStepId: number) {
    this.dataService.updateMasterAttendanceMode(attendanceMasterModeId, modeStepId).subscribe(
      (response) => {
        // this.getAttendanceModeMethodCall();
        this.getMasterAttendanceModeMethodCall();
        this.getAttendanceModeStep();
        this.helperService.registerOrganizationRegistratonProcessStepData(Key.ATTENDANCE_MODE_ID, Key.PROCESS_COMPLETED);
        if (attendanceMasterModeId == 1 && modeStepId == 1) {
          this.locationType = '';
        }
        // else {

        // }
        // this.getFlexibleAttendanceMode();
        // setTimeout(() => {
        //   this.helperService.showToast(
        //     'Attedance Master Mode updated successfully.',
        //     Key.TOAST_STATUS_SUCCESS
        //   );
        // }, 1000);
      },
      (error) => {
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
      }
    );
  }



  selectedAttendanceModeId: number = 0;
  getAttendanceModeMethodCall() {
    debugger;
    this.dataService.getAttendanceModeNew().subscribe(
      (response: any) => {
        debugger;
        if (response.status) {
          this.selectedAttendanceModeId = response.object.id;
        }
        // console.log(this.selectedAttendanceModeId);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  selectedMasterAttendanceModeId: number = 0;
  getMasterAttendanceModeMethodCall() {
    debugger;
    this.dataService.getMasterAttendanceMode().subscribe(
      (response: any) => {
        debugger;
        if (response.status) {
          this.selectedMasterAttendanceModeId = response.object;
        }
        console.log(this.selectedMasterAttendanceModeId);
      },
      (error) => {
        console.log(error);
      }
    );
  }


  attendanceModeStep: number = 0;
  getAttendanceModeStep() {
    debugger;
    this.dataService.getAttendanceModeStep().subscribe(
      (response: any) => {
        debugger;
        if (response.status) {

          if (response.object != null) {
            this.attendanceModeStep = response.object;
          } else {

            this.attendanceModeStep = 0;
          }

        }
        console.log(this.attendanceModeStep);
      },
      (error) => {
        console.log(error);
      }
    );
  }




  attendanceModeList: AttendanceMode[] = [];
  getAttendanceModeAllMethodCall() {
    debugger;
    this.dataService.getAttendanceModeAll().subscribe(
      (response) => {
        this.attendanceModeList = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  isAttendanceModeLoader: boolean = false;
  goToDashboardSection() {
    debugger;
    this.isAttendanceModeLoader = true;
    this.showSuccess = true;
    this.dataService.markStepAsCompleted(5);
    this.onboardingService.saveOrgOnboardingStep(5).subscribe((resp) => {
      this.onboardingService.refreshOnboarding();
    });
    
    this.dataService.sendOnboardingNotificationInWhatsapp().subscribe(
      (response) => {
        console.log('Messages Sent Successfully');
      },
      (error) => {
        // console.log(error);
      }
    );
    this.isAttendanceModeLoader = false;
  }

  organizationAddressDetail: OrganizationAddressDetail =
    new OrganizationAddressDetail();
  toggle = false;
  @ViewChild('closeAddressModal') closeAddressModal!: ElementRef;
  setOrganizationAddressDetailMethodCall() {
    this.toggle = true;
    this.dataService
      .setOrganizationAddressDetail(this.organizationAddressDetail)
      .subscribe(
        (response: OrganizationAddressDetail) => {
          // console.log(response);
          this.toggle = false;
          this.isUpdate = true;
          this.updateAttendanceModeMethodCall(this.currentAttendanceModeId);
          this.closeAddressModal?.nativeElement.click();
          // this.resetAddressDetailsModal();
          // setTimeout(() => {
          //   this.helperService.showToast(
          //     'Attedance Mode updated successfully',
          //     Key.TOAST_STATUS_SUCCESS
          //   );
          // }, 1000);
          // this.helperService.showToast("Attedance Mode updated successfully", Key.TOAST_STATUS_SUCCESS);
        },
        (error) => {
          console.error(error);
        }
      );
  }

  resetAddressDetailsModal() {
    this.organizationAddressForm.resetForm();
    this.organizationAddressDetail = new OrganizationAddressDetail();
    this.isFormInvalid = false;
  }
  isAttendanceModeBackLoading: boolean = false;
  backPage() {
    this.isAttendanceModeBackLoading = true;
    this.dataService.markStepAsCompleted(3);
    // this.onboardingService.saveOrgOnboardingStep(3).subscribe();
    this.onboardingService.saveOrgOnboardingStep(3).subscribe((resp) => {
      this.onboardingService.refreshOnboarding();
    });
    this.router.navigate([constant.ORG_ONBOARDING_SHIFT_TIME_ROUTE]);
    // this.isAttendanceModeBackLoading = false;
    setTimeout(() => {
      this.isAttendanceModeBackLoading = false;
    }, 5000);
    // this.onboardingService.refreshOnboarding();
  }

  @ViewChild('placesRef') placesRef!: GooglePlaceDirective;

  // checkLocationAccess(){
  //   navigator.permissions.query({ name: 'geolocation' })
  //   .then( (PermissionStatus) => {
  //     if (PermissionStatus.state == 'granted') {
  //       if (Key.GEOLOCATION in navigator) {
  //         navigator.geolocation.getCurrentPosition((position) => {


  //         },
  //         (error) => {

  //         },
  //         {
  //           enableHighAccuracy: true,  // Precise location
  //         maximumAge: 0              // Prevent cached locations
  //         }
  //         );
  //       }
  //     } else {
  //       this.requestPermission();
  //     } 

  //   });

  // }
  // requestPermission(){
  //   window.alert('To enable Location Services and allow the site to determine your location, click the location icon in the address bar and select "Always allow.');  
  //   if (Key.GEOLOCATION in navigator) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //       },
  //       (error) => {
  //         if (error.code === error.PERMISSION_DENIED) {
  //           window.alert('To enable Location Services and allow the site to determine your location, click the location icon in the address bar and select "Always allow.');  

  //         //  this.requestPermission();
  //         navigator.permissions.query({name:'geolocation'})
  //           console.error('User denied the request for Geolocation.');
  //         } else if (error.code === error.POSITION_UNAVAILABLE) {
  //           console.error('Location information is unavailable.');
  //         } else if (error.code === error.TIMEOUT) {
  //           console.error('The request to get user location timed out.');
  //         } else {
  //           console.error('An unknown error occurred.');
  //         }
  //       },
  //       {
  //         enableHighAccuracy: true,  // Precise location
  //         maximumAge: 0              // Prevent cached locations
  //       }
  //     );
  //   }else{
  //    window.alert("Geolocation is not supported by this browser.");
  //   }
  // }

  public handleAddressChange(e: any) {
    debugger;
    var id = this.organizationAddressDetail.id;
    this.organizationAddressDetail = new OrganizationAddressDetail();
    this.organizationAddressDetail.id = id;
    this.organizationAddressDetail.longitude = e.geometry.location.lng();
    this.organizationAddressDetail.latitude = e.geometry.location.lat();

    // console.log(e.geometry.location.lat());
    // console.log(e.geometry.location.lng());
    this.organizationAddressDetail.addressLine1 = e.name + ', ' + e.vicinity;

    e?.address_components?.forEach((entry: any) => {
      // console.log(entry);

      if (entry.types?.[0] === 'route') {
        this.organizationAddressDetail.addressLine2 = entry.long_name + ',';
      }
      if (entry.types?.[0] === 'sublocality_level_1') {
        this.organizationAddressDetail.addressLine2 =
          this.organizationAddressDetail.addressLine2 + entry.long_name;
      }
      if (entry.types?.[0] === 'locality') {
        this.organizationAddressDetail.city = entry.long_name;
      }
      if (entry.types?.[0] === 'administrative_area_level_1') {
        this.organizationAddressDetail.state = entry.long_name;
      }
      if (entry.types?.[0] === 'country') {
        this.organizationAddressDetail.country = entry.long_name;
      }
      if (entry.types?.[0] === 'postal_code') {
        this.organizationAddressDetail.pincode = entry.long_name;
      }
    });
  }
  // new fetch current location code
  fetchCurrentLocationLoader: boolean = false;
  locationLoader: boolean = false;

  currentLocation() {
    debugger
    this.isLatLongFieldOpen = false;
    this.locationLoader = true;
    this.fetchCurrentLocationLoader = true;

    this.getCurrentLocation()
      .then((coords) => {
        this.placesService
          .getLocationDetails(coords.latitude, coords.longitude)
          .then((details) => {
            this.locationLoader = false;
            this.fetchCurrentLocationLoader = false;

            this.organizationAddressDetail = new OrganizationAddressDetail();
            this.organizationAddressDetail.longitude = coords.longitude;
            this.organizationAddressDetail.latitude = coords.latitude;
            this.organizationAddressDetail.addressLine1 = details.formatted_address;
            this.organizationAddressDetail.addressLine2 = '';

            // Dynamically retrieve address components
            const addressComponents: AddressComponent[] = details.address_components || [];

            addressComponents.forEach((component: AddressComponent) => {
              const types = component.types || [];
              if (types.includes('locality')) {
                this.organizationAddressDetail.city = component.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                this.organizationAddressDetail.state = component.long_name;
              } else if (types.includes('country')) {
                this.organizationAddressDetail.country = component.long_name;
              } else if (types.includes('postal_code')) {
                this.organizationAddressDetail.pincode = component.long_name;
              }
            });

          })
          .catch((error) => {
            console.error('Error fetching location details:', error);
            this.locationLoader = false;
            this.fetchCurrentLocationLoader = false;
          });
      })
      .catch((error) => {
        window.alert('To enable Location Services and allow the site to determine your location, click the location icon in the address bar and select "Always allow.');

        console.error('Error fetching current location:', error);
        this.locationLoader = false;
        this.fetchCurrentLocationLoader = false;
      });
  }
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
  //           this.organizationAddressDetail = new OrganizationAddressDetail();
  //           // this.organizationAddressDetail.id = id;
  //           this.organizationAddressDetail.longitude = coords.longitude;
  //           this.organizationAddressDetail.latitude = coords.latitude;

  //           console.log('formatted_address:', details);
  //           this.organizationAddressDetail.addressLine1 =
  //             details.formatted_address;
  //           this.organizationAddressDetail.addressLine2 = '';
  //           if (details.address_components[1].types[0] === 'locality') {
  //             this.organizationAddressDetail.city =
  //               details.address_components[2].long_name;
  //           }
  //           if (
  //             details.address_components[4].types[0] ===
  //             'administrative_area_level_1'
  //           ) {
  //             this.organizationAddressDetail.state =
  //               details.address_components[4].long_name;
  //           }
  //           if (details.address_components[5].types[0] === 'country') {
  //             this.organizationAddressDetail.country =
  //               details.address_components[5].long_name;
  //           }
  //           if (details.address_components[6].types[0] === 'postal_code') {
  //             this.organizationAddressDetail.pincode =
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
            this.lat = position.coords.latitude;
            this.lng = position.coords.longitude;
            this.isShowMap = true;
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (err) => {
            reject(err);
          },
          {
            enableHighAccuracy: true,  // Precise location
          maximumAge: 0              // Prevent cached locations
          }
        );
      } else {
        reject('Geolocation is not supported by this browser.');
      }
    })
  }

  // getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  //   return new Promise((resolve, reject) => {
  //     if (navigator.geolocation) {
  //       navigator.geolocation.getCurrentPosition(
  //         (position) => {
  //           resolve({
  //             latitude: position.coords.latitude,
  //             longitude: position.coords.longitude,
  //           });
  //         },
  //         (err) => {
  //           reject(err);
  //         }
  //       );
  //     } else {
  //       reject('Geolocation is not supported by this browser.');
  //     }
  //   });
  // }

  isFormInvalid: boolean = false;
  @ViewChild('organizationAddressForm') organizationAddressForm!: NgForm;
  checkFormValidation() {
    if (
      this.organizationAddressForm.invalid ||
      !this.organizationAddressDetail.longitude ||
      !this.organizationAddressDetail.latitude
    ) {
      this.isFormInvalid = true;
      return;
    } else {
      if (!this.organizationAddressDetail.country) {
        this.isFormInvalid = true;
      } else {
        this.isFormInvalid = false;
      }
    }
  }

  submit() {
    debugger;

    if (this.selectedMasterAttendanceModeId === 1 && this.attendanceModeStep === 3) {
      this.checkFormValidation();

      if (this.isFormInvalid == true) {
        return;
      } else {
        this.setOrganizationAddressDetailMethodCall();
      }
    }
  }

  // public resetAddressDetailsModal() {
  //   this.organizationAddressForm.resetForm(); // This resets the form
  //   this.organizationAddressDetail = new OrganizationAddressDetail(); // Optionally, reset the model
  //   this.isFormInvalid = false;
  // }

  isShowMap: boolean = false;
  lat!: number;
  lng!: number;
  zoom: number = 15;
  markerPosition: any;
  getOrganizationAddressDetailMethodCall() {
    debugger;
    this.dataService.getOrganizationAddressDetail().subscribe(
      (response: OrganizationAddressDetail) => {
        if (response) {
          // console.log(response);
          this.organizationAddressDetail = response;
          // console.log(this.organizationAddressDetail.latitude);
          if (this.organizationAddressDetail.latitude == null) {
            this.currentLocation();
          } else {
            this.lat = Number(this.organizationAddressDetail.latitude);
            this.lng = Number(this.organizationAddressDetail.longitude);
            this.isShowMap = true;
          }
          if(this.organizationAddressDetail.latitude & this.organizationAddressDetail.longitude){
            this.organizationAddressDetail.latitude = this.lat;
            this.organizationAddressDetail.longitude = this.lat
          }
        } else {
          console.log('No address details found');
        }
      },
      (error: any) => {
        console.error('Error fetching address details:', error);
      }
    );
  }

  showSelectModeFlag: boolean = false;
  showSelectMasterModeFlag: boolean = false;

  MODE1 = Key.MODE1;
  MODE2 = Key.MODE2;
  MODE3 = Key.MODE3;

  selectMasterAttendanceMode(goToStep: number) {

    if (goToStep === 2) {
      this.selectedAttendanceModeId = 0;
      this.showSelectModeFlag = true;
    } else if (goToStep === 1) {
      this.selectedMasterAttendanceModeId = 0;
      this.showSelectMasterModeFlag = true;
    } else {
      this.showSelectModeFlag = false;
      this.showSelectMasterModeFlag = false;
    }

  }

  finishButtonEnableFlag: boolean = false;

  finishButtonFlag() {
    if (this.selectedMasterAttendanceModeId === 1 && this.attendanceModeStep != 3) {
      this.finishButtonEnableFlag = false;
    } else if ((this.selectedMasterAttendanceModeId === 1 && this.attendanceModeStep === 3) || this.selectedMasterAttendanceModeId === 2 || this.selectedMasterAttendanceModeId === 3) {
      this.finishButtonEnableFlag = true;
    }
  }

  basicSubscriptionPlanId: number = 1;
  showSuccess: boolean = false;
  registerBillingAndSubscriptionTempMethodCall(subscriptionPlanId: number) {
    debugger
    this.dataService.registerBillingAndSubscriptionTemp(subscriptionPlanId).subscribe(
      (response) => {
        // this.helperService.showToast("Free trial started successfully.", Key.TOAST_STATUS_SUCCESS);
        setTimeout(() => {
          // this.router.navigate(['/dashboard']);
         
          // this.router.navigate(['/organization-onboarding/onboarding-successful']);
          // main route 
          // this.router.navigate(['/to-do-step-dashboard']);
        }, 1000);

      },
      (error) => {
        this.helperService.showToast("Error while purchasing the plan!", Key.TOAST_STATUS_ERROR);
      }
    );
  }

  radiusOptions: number[] = [50, 100, 200, 500]; // Available radius options
  selectedRadius: number | null = null; // Holds the selected radius or null
  errorMessage: string | null = null; // Error message for invalid input
  onRadiusChange(value: any) {
    // Ensure that the value is either a number or a string that can be converted to a number
    const radiusValue = typeof value === 'string' ? parseInt(value, 10) : value;

    // Validate the radius value
    if (isNaN(radiusValue) || radiusValue < 50) {
      this.errorMessage = 'Radius must be greater than or equal to 50 meters.';
      this.selectedRadius = null; // Reset selected value
    } else {
      this.errorMessage = null; // Clear any previous error
      this.selectedRadius = radiusValue; // Update selected value
    }
  }

  minRadius: boolean = false;
  radiusFilteredOptions: { label: string, value: string }[] = [];
  onChange(value: string): void {
    const numericValue = Number(value);
    if (numericValue < 50) {
      this.minRadius = true;

    } else {
      this.minRadius = false;

    }
    this.radiusFilteredOptions = this.radius.filter((option) =>
      option.toLowerCase().includes(value.toLowerCase())
    ).map((option) => ({ label: `${option}-Meters`, value: option }));

  }
  radius: string[] = ["50", "100", "200", "500", "1000"];

  preventLeadingWhitespace(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    // Prevent leading spaces
    if (event.key === ' ' && input.selectionStart === 0) {
      event.preventDefault();
    }
  }

  onFocus(): void {
    this.radiusFilteredOptions = this.radius.map((option) => ({
      label: `${option}-Meters`,
      value: option
    }));
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;

    // Check if the pressed key is not a digit (0-9) or is not a control key
    if (!/[0-9]/.test(event.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key)) {
      event.preventDefault();
    }

    // Optionally, restrict the maximum value if it exceeds 99000
    if (input.value.length >= 5 && event.key !== 'Backspace') {
      event.preventDefault();
    }
  }

  onSelect(event: any): void {

    const selectedValue = event.nzValue;
    this.organizationAddressDetail.radius = selectedValue;
  }

  // onSelect(event: any): void {
  //   const selectedValue = event?.option?.value.replace('m', '');
  //   this.organizationAddressDetail.radius = selectedValue;
  // }

  locationType: string = '';

  onLocationTypeChange() {
    if (this.locationType === 'fixed') {
      this.organizationAddressDetail.addressLine1 = '';
      this.organizationAddressDetail.radius = '';
      this.resetAddressDetailsModal();
    }

  }
  offFinishSetup: boolean = false;
  saveAttendaceFlexibleModeInfo(locationType: string) {
    this.dataService.saveFlexibleAttendanceMode(locationType).subscribe((response) => {
      if (locationType == 'fixed') {
       
        this.updateMasterAttendanceModeMethodCall(1, 3);
        this.scrollToView();
        this.offFinishSetup = true;
      } else {
        this.offFinishSetup = false;
      }
    }, (error) => {
      console.log(error);
    })
  }

  // saveLocationInfo() {
  //   if(this.locationType == 'flexible') {
  //     this.saveAttendaceFlexibleModeInfo();
  //     this.getAttendanceModeMethodCall();
  //     this.closeAddressModal.nativeElement.click();
  //   }else if(this.locationType == 'fixed') {
  //    this.saveAttendaceFlexibleModeInfo();
  //    this.setOrganizationAddressDetailMethodCall();
  //   }
  // }

  getFlexibleAttendanceMode() {
    this.dataService.getFlexibleAttendanceMode().subscribe((response) => {
      if (response.object == true) {
        this.locationType = 'flexible';
      } else {
        this.locationType = 'fixed';
        this.updateMasterAttendanceModeMethodCall(1, 3);
      }
    }, (error) => {
      console.log(error);
    })
  }

    @ViewChild('scrollToBottom') scrollToBottom!: ElementRef;

  scrollToView() {
    const element = document.getElementById("locationForm");
    if(element){
      element.scrollIntoView({ behavior: "smooth"});

    }
    return true;
    // this.scrollToBottom.nativeElement.scrollTop =
    //   this.scrollToBottom.nativeElement.scrollHeight;
  }

  // new 

  mapCenter: { lat: number; lng: number } = { lat: this.lat, lng: this.lng };

  onMapClick(event: any) {
    this.organizationAddressDetail.latitude = event.coords.lat;
    this.organizationAddressDetail.longitude = event.coords.lng;
  }

  onMarkerDragEnd(event: any) {
    this.organizationAddressDetail.latitude = event.coords.lat;
    this.organizationAddressDetail.longitude = event.coords.lng;
    this.mapCenter = { lat: this.lat, lng: this.lng };
  }



  public handleAddressChanges(e: any) {
    //  console.log('ghdm',e);

    this.lat = e.geometry.location.lat();
    this.lng = e.geometry.location.lng();
    // this.getAddress(this.lat, this.lng);
  }


centerChanged(event: any) {
  // console.log(event);
  this.newLat=event.lat;
  this.newLng=event.lng;
}
newLat:any;
newLng:any

mapReady(map:any) {
  // console.log("map=======",map);
map.addListener("dragend", () => {
  this.lat=this.newLat;
  this.lng=this.newLng;
  // console.log("999999",this.lat, this.lng);
  //  this.getAddress(this.lat, this.lng);
  });
}


onZoomChange(event: number) {
  // console.log('Zoom level changed:', event);
  this.lat=this.newLat;
  this.lng=this.newLng;
  // this.getAddress(this.lat, this.lng);
}


getData(event:any){
  debugger
 console.log("event :" + event);

 var id = this.organizationAddressDetail.id;
 var branch = this.organizationAddressDetail.branch;
 var radius = this.organizationAddressDetail.radius;
 this.organizationAddressDetail = new OrganizationAddressDetail();
 this.organizationAddressDetail.id = id;
 this.organizationAddressDetail.branch = branch;
 this.organizationAddressDetail.radius = radius;
 this.organizationAddressDetail.longitude = event.longitude;
 this.organizationAddressDetail.latitude = event.latitude;
 this.organizationAddressDetail.addressLine1 = event.addressLine1
 this.organizationAddressDetail.addressLine2 = event.addressLine2;
 this.organizationAddressDetail.city = event.city;
 this.organizationAddressDetail.state = event.state;
 this.organizationAddressDetail.country = event.country;
 this.organizationAddressDetail.pincode = event.pincode;
}

isLatLongFieldOpen: boolean = false;
openLatLongField() {
  this.isLatLongFieldOpen = true;
}


public handleAddressChange2(e: any) {
   console.log('ghdm',e);
 debugger
  // this.lat = e.geometry.location.lat();
  // this.lng = e.geometry.location.lng();

  
  // this.organizationAddressDetail = new OrganizationAddressDetail();
  this.organizationAddressDetail.longitude = this.newLng;
  this.organizationAddressDetail.latitude = this.newLat;

  this.organizationAddressDetail.addressLine1 = e.formatted_address;

e?.address_components?.forEach((entry: any) => {
  // console.log(entry);

  if (entry.types?.[0] === 'route') {
    this.organizationAddressDetail.addressLine2 = entry.long_name + ',';
  }
  if (entry.types?.[0] === 'sublocality_level_1') {
    this.organizationAddressDetail.addressLine2 =
      this.organizationAddressDetail.addressLine2 + entry.long_name;
  }
  if (entry.types?.[0] === 'locality') {
    this.organizationAddressDetail.city = entry.long_name;
  }
  if (entry.types?.[0] === 'administrative_area_level_1') {
    this.organizationAddressDetail.state = entry.long_name;
  }
  if (entry.types?.[0] === 'country') {
    this.organizationAddressDetail.country = entry.long_name;
  }
  if (entry.types?.[0] === 'postal_code') {
    this.organizationAddressDetail.pincode = entry.long_name;
  }
});


  // this.setLatLng(this.organizationAddressDetail);
  // this.getAddress(this.lat, this.lng);
}

getAddressFromCoords(lat: number, lng: number): void {
  debugger
  console.log("7898765678" , lat, lng);
  this.newLat= lat;
  this.newLng= lng;
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    if (status === google.maps.GeocoderStatus.OK && results && results[0] ) {
      this.handleAddressChange2(results[0]); 
    } else {
      console.error('Geocode was not successful for the following reason: ' + status);
    }
  });
}

//  new 

showLocationForm() {
  if( this.selectedMasterAttendanceModeId === 1 && this.attendanceModeStep === 3 && this.locationType === 'fixed' && this.selectedAttendanceModeId != 1) {
    return true;
  }else {
    return false;
  }
}
}
