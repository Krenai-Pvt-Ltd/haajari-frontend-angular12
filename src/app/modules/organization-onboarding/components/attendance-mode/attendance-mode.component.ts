import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Key } from 'src/app/constant/key';
import { AttendanceMode } from 'src/app/models/attendance-mode';
import { OrganizationAddressDetail } from 'src/app/models/organization-address-detail';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';

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
  ) {}

  ngOnInit(): void {
    this.getAttendanceModeAllMethodCall();
    this.getAttendanceModeMethodCall();
  }

  isUpdate: boolean = false;
  currentAttendanceModeId: number = 0;
  isAttendanceModeSelected: boolean = false;

  updateAttendanceMode(attendanceModeId: number) {
    if (attendanceModeId == Key.MANUAL_ATTENDANCE) {
      this.updateAttendanceModeMethodCall(attendanceModeId);
    } else {
      this.attendanceWithLocationButton.nativeElement.click();
      this.currentAttendanceModeId = attendanceModeId;
    }
  }

  @ViewChild('attendanceWithLocationButton')
  attendanceWithLocationButton!: ElementRef;
  updateAttendanceModeMethodCall(attendanceModeId: number) {
    this.dataService.updateAttendanceMode(attendanceModeId).subscribe(
      (response) => {
        this.getAttendanceModeMethodCall();
        setTimeout(() => {
          this.helperService.showToast(
            'Attedance Mode updated successfully.',
            Key.TOAST_STATUS_SUCCESS,
          );
        }, 1000);
      },
      (error) => {
        this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
      },
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
        console.log(this.selectedAttendanceModeId);
      },
      (error) => {
        console.log(error);
      },
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
      },
    );
  }

  isAttendanceModeLoader: boolean = false;
  goToDashboardSection() {
    this.isAttendanceModeLoader = true;
    this.dataService.markStepAsCompleted(5);
    // this.onboardingService.saveOrgOnboardingStep(5).subscribe();
    this.onboardingService.saveOrgOnboardingStep(5).subscribe((resp) => {
      this.onboardingService.refreshOnboarding();
    });
    this.router.navigate(['/dashboard']);
    this.dataService.sendOnboardingNotificationInWhatsapp().subscribe(
      (response) => {
        console.log('Messages Sent Successfully');
        // this.onboardingService.refreshOnboarding();
      },
      (error) => {
        this.isAttendanceModeLoader = false;
        console.log(error);
      },
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
          this.closeAddressModal.nativeElement.click();
          this.resetAddressDetailsModal();
          setTimeout(() => {
            this.helperService.showToast(
              'Attedance Mode updated successfully',
              Key.TOAST_STATUS_SUCCESS,
            );
          }, 1000);
          // this.helperService.showToast("Attedance Mode updated successfully", Key.TOAST_STATUS_SUCCESS);
        },
        (error) => {
          console.error(error);
        },
      );
  }

  resetAddressDetailsModal() {
    this.organizationAddressDetail = new OrganizationAddressDetail();
  }
  isAttendanceModeBackLoading: boolean = false;
  backPage() {
    this.isAttendanceModeBackLoading = true;
    this.dataService.markStepAsCompleted(3);
    // this.onboardingService.saveOrgOnboardingStep(3).subscribe();
    this.onboardingService.saveOrgOnboardingStep(3).subscribe((resp) => {
      this.onboardingService.refreshOnboarding();
    });
    this.router.navigate(['/organization-onboarding/shift-time-list']);
    // this.isAttendanceModeBackLoading = false;
    setTimeout(() => {
      this.isAttendanceModeBackLoading = false;
    }, 5000);
    // this.onboardingService.refreshOnboarding();
  }

  @ViewChild('placesRef') placesRef!: GooglePlaceDirective;

  public handleAddressChange(e: any) {
    debugger;
    var id = this.organizationAddressDetail.id;
    this.organizationAddressDetail = new OrganizationAddressDetail();
    this.organizationAddressDetail.id = id;
    this.organizationAddressDetail.longitude = e.geometry.location.lng();
    this.organizationAddressDetail.latitude = e.geometry.location.lat();

    console.log(e.geometry.location.lat());
    console.log(e.geometry.location.lng());
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
}
