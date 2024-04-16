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
  styleUrls: ['./attendance-mode.component.css']
})
export class AttendanceModeComponent implements OnInit {

  constructor(private dataService: DataService, private helperService: HelperService, private router: Router, private onboardingService: OrganizationOnboardingService) { }

  ngOnInit(): void {
    this.getAttendanceModeAllMethodCall();
    this.getAttendanceModeMethodCall();
  }

  isUpdate: boolean = false;
  attenModeId : number = 0;
  isAttendanceModeSelected: boolean = false;

  @ViewChild("attendancewithlocationssButton") attendancewithlocationssButton !: ElementRef;
  updateAttendanceModeMethodCall(attendanceModeId: number) {
    this.attenModeId = attendanceModeId;
    if (attendanceModeId == 2 || attendanceModeId == 3) {
      this.attendancewithlocationssButton.nativeElement.click();
    }
    if((this.isUpdate && (attendanceModeId == 2 || attendanceModeId == 3)) || (attendanceModeId == 1)) {
    this.isUpdate = false;
    this.dataService.updateAttendanceMode(attendanceModeId).subscribe((response) => {
      this.getAttendanceModeMethodCall();
      // if (attendanceModeId == 2 || attendanceModeId == 3) {
      //   this.attendancewithlocationssButton.nativeElement.click();
      // }
      setTimeout(() => {
        if (attendanceModeId == 1) {
          this.isAttendanceModeSelected = true;
          this.helperService.showToast("Attedance Mode updated successfully", Key.TOAST_STATUS_SUCCESS);
        }
      }, 1000);

    }, (error) => {
      this.helperService.showToast(error.message, Key.TOAST_STATUS_ERROR);
    })
    }
  }



  selectedAttendanceModeId: number = 0;
  getAttendanceModeMethodCall() {
    debugger
    this.dataService.getAttendanceModeNew().subscribe((response: any) => {
      debugger
      if (response.status) {
        this.selectedAttendanceModeId = response.object.id;
      }
    }, (error) => {
      console.log(error);
    })
  }

  attendanceModeList: AttendanceMode[] = [];
  getAttendanceModeAllMethodCall() {
    debugger
    this.dataService.getAttendanceModeAll().subscribe((response) => {
      this.attendanceModeList = response;
    }, (error) => {
      console.log(error);
    })
  }

  goToDashboardSection() {
    this.dataService.markStepAsCompleted(5);
    this.onboardingService.saveOrgOnboardingStep(5).subscribe();
    this.router.navigate(['/dashboard']);
    this.dataService.sendOnboardingNotificationInWhatsapp().subscribe((response) => {
      console.log("Messages Sent Successfully");
    }, (error) => {
      console.log(error);
    })

  }

  organizationAddressDetail: OrganizationAddressDetail = new OrganizationAddressDetail();
  toggle = false;
  @ViewChild("closeAddressModal") closeAddressModal !: ElementRef;
  setOrganizationAddressDetailMethodCall() {
    this.toggle = true;
    this.dataService.setOrganizationAddressDetail(this.organizationAddressDetail)
      .subscribe(
        (response: OrganizationAddressDetail) => {
          // console.log(response);  
          this.toggle = false;
          this.isUpdate= true;
          this.updateAttendanceModeMethodCall(this.attenModeId);
          this.closeAddressModal.nativeElement.click();
          setTimeout(() => {
              this.helperService.showToast("Attedance Mode updated successfully", Key.TOAST_STATUS_SUCCESS);
          }, 1000);
          // this.helperService.showToast("Attedance Mode updated successfully", Key.TOAST_STATUS_SUCCESS);


        },
        (error) => {
          console.error(error);

        })

      ;
  }

  @ViewChild("placesRef") placesRef!: GooglePlaceDirective;

  public handleAddressChange(e: any) {
    debugger
    var id = this.organizationAddressDetail.id;
    this.organizationAddressDetail = new OrganizationAddressDetail();
    this.organizationAddressDetail.id = id;
    this.organizationAddressDetail.longitude = e.geometry.location.lng();
    this.organizationAddressDetail.latitude = e.geometry.location.lat();

    console.log(e.geometry.location.lat());
    console.log(e.geometry.location.lng());
    this.organizationAddressDetail.addressLine1 = e.name + ", " + e.vicinity;


    e?.address_components?.forEach((entry: any) => {
      // console.log(entry);

      if (entry.types?.[0] === "route") {
        this.organizationAddressDetail.addressLine2 = entry.long_name + ",";
      }
      if (entry.types?.[0] === "sublocality_level_1") {
        this.organizationAddressDetail.addressLine2 = this.organizationAddressDetail.addressLine2 + entry.long_name
      }
      if (entry.types?.[0] === "locality") {
        this.organizationAddressDetail.city = entry.long_name
      }
      if (entry.types?.[0] === "administrative_area_level_1") {
        this.organizationAddressDetail.state = entry.long_name
      }
      if (entry.types?.[0] === "country") {
        this.organizationAddressDetail.country = entry.long_name
      }
      if (entry.types?.[0] === "postal_code") {
        this.organizationAddressDetail.pincode = entry.long_name
      }



    });
  }

}
