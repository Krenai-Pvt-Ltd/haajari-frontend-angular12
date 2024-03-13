import { DatePipe, Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { CustomHolidays } from 'src/app/models/customHolidays';
import { OrganizationAddressDetail } from 'src/app/models/organization-address-detail';
import { UniversalHoliday } from 'src/app/models/UniversalHoliday';
import { WeekDay } from 'src/app/models/WeekDay';
import { WeeklyHoliday } from 'src/app/models/WeeklyHoliday';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrganizationOnboardingService } from 'src/app/services/organization-onboarding.service';

@Component({
  selector: 'app-holiday-setting',
  templateUrl: './holiday-setting.component.html',
  styleUrls: ['./holiday-setting.component.css']
})
export class HolidaySettingComponent implements OnInit {

  toggle = false;
  organizationAddressDetail : OrganizationAddressDetail = new OrganizationAddressDetail();

  constructor(private _location:Location,
    private dataService : DataService,
    private datePipe: DatePipe,
    private _router:Router,
    private _onboardingService: OrganizationOnboardingService,
    private helperService: HelperService) { }

  onboardingViaString:string='';

  ngOnInit(): void {
    this.getOnboardingStep();
    this.getUniversalHolidays();
    this.getCustomHolidays();
    this.getWeeklyHolidays();
    this.getWeekDays();
  }

  back(){
    this._location.back();
  }

  weekDay: WeekDay[] = [];

  submitWeeklyHolidaysLoader:boolean=false;
  @ViewChild("closeWeeklyHolidayModal") closeWeeklyHolidayModal!:ElementRef;
  submitWeeklyHolidays() {
    const selectedWeekDays = this.weekDay
                              .filter(day => day.selected)
                              .map(day => day.name);
     this.submitWeeklyHolidaysLoader=true;
    this.dataService.registerWeeklyHolidays(selectedWeekDays).subscribe({
      next: (response) => {
        console.log('Weekly holidays registered successfully', response);
        this.getWeeklyHolidays(); 
        this.submitWeeklyHolidaysLoader=false;
        this.closeWeeklyHolidayModal.nativeElement.click();
      },
      error: (error) => {
        this.submitWeeklyHolidaysLoader=false;
        console.error('Failed to register weekly holidays', error);
      }
    });
  }

  deleteWeeklyHolidays(id: number) {
      this.dataService.deleteWeeklyHolidays(id).subscribe(
        response => {
          console.log(response);
          // alert('Weekly holiday deleted successfully');
          this.getWeeklyHolidays(); 
        },
        error => {
          console.error('Error deleting weekly holiday:', error);
        }
      );
  }

  deleteCustomHolidays(id:number){
    this.dataService.deleteCustomHolidays(id).subscribe(
      response => {
        console.log(response);
        this.getCustomHolidays(); 
      },
      error => {
        console.error('Error deleting weekly holiday:', error);
      }
    );
  }

  formatDateIn(newdate:any) {
    const date = new Date(newdate);
    const formattedDate = this.datePipe.transform(date, 'dd MMMM, yyyy');
    return formattedDate;
  }
  
  holidayList: { name: string; date: string }[] = [{ name: '', date: '' }];

  addHoliday() {
    this.holidayList.push({ name: '', date: '' });
  }

  removeHoliday(index: number) {
    this.holidayList.splice(index, 1);
  }

  isCustomHolidayLoader:boolean=false;
  @ViewChild("customHolidayModal") customHolidayModal!:ElementRef;
  registerCustomHolidays() {
    console.log(this.holidayList);
    this.isCustomHolidayLoader=true;
    this.dataService.registerCustomHolidays(this.holidayList).subscribe({
      next: (response) => {
        this.getCustomHolidays();
        this.isCustomHolidayLoader=false;
        this.holidayList= [{ name: '', date: '' }];
        this.customHolidayModal.nativeElement.click();
      },
      error: (error) => {
        this.isCustomHolidayLoader=false;
        console.error('Error registering custom holidays:', error)}
    });
  }

  isDateGreaterThanToday(date: string): boolean {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let compareDate = new Date(date);

    return compareDate > today;
  }

  // ##########  holidays #############

  isHolidayErrorPlaceholder:boolean=false;
  universalHolidays: UniversalHoliday[] = [];

  getUniversalHolidays() {
    this.dataService.getUniversalHolidays().subscribe({
      next: (holidays) => {
        this.universalHolidays = holidays;
      },
      error: (error) => {
        this.isHolidayErrorPlaceholder=true;
        console.error('Error fetching universal holidays:', error);
      }
    });
  }
  
  customHolidays: CustomHolidays[] = [];

  getCustomHolidays() {
    this.dataService.getCustomHolidays().subscribe({
      next: (holidays) => {
        this.customHolidays = holidays;
      },
      error: (error) => {
        this.isHolidayErrorPlaceholder=true;
        console.error('Error fetching custom holidays:', error);
      }
    });
  }
  
  isWeeklyHolidayErrorPlaceholder:boolean=false;
  weeklyHolidays: WeeklyHoliday[] = [];

  weeklyHolidaysLoading: boolean = false;
  getWeeklyHolidays() {
    this.weeklyHolidaysLoading = true
    this.dataService.getWeeklyHolidays().subscribe(holidays => {
      this.weeklyHolidays = holidays;
      this.getWeekDays();
      this.weeklyHolidaysLoading = false;

    },(error) => {
      this.isWeeklyHolidayErrorPlaceholder=true;
      this.weeklyHolidaysLoading = false;
      console.error('Error fetching custom holidays:', error);
    });
  }

  getWeekDays() {
    this.dataService.getWeekDays().subscribe(holidays => {
      this.weekDay = holidays.map(day => ({
        ...day,
        selected: day.selected === 1
      }));
      console.log(this.weekDay); 
    });
  }

  next(){
    if(this.onboardingViaString==='SLACK'){
      this.dataService.markStepAsCompleted(4);
      this.helperService.showToast("your organization onboarding has been sucessfully completed", Key.TOAST_STATUS_SUCCESS);
      this._onboardingService.saveOrgOnboardingStep(4).subscribe();
      this._router.navigate(["/organization-onboarding/attendance-rule-setup"]);
    }else{
      this.dataService.markStepAsCompleted(3);
      this._onboardingService.saveOrgOnboardingStep(3).subscribe();
      this._router.navigate(["/organization-onboarding/upload-team"]);
    }
  }

  getOnboardingStep(){
    debugger
    this._onboardingService.getOrgOnboardingStep().subscribe((response:any)=>{
      if(response.status){
        this.onboardingViaString = response.object.onboardingString;
      }
      
    })

  }
  

}
