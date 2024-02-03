import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css']
})
export class AccountSettingsComponent implements OnInit, AfterViewInit {


  accountDetailsTab: string | null = null;
  securityTab: any;
  profilePreferencesTab: any;
  referralProgramTab: any;

  constructor(private _routeParam: ActivatedRoute,
    public _data: DataService,
    private cdr: ChangeDetectorRef) {
    debugger
    if (this._routeParam.snapshot.queryParamMap.has('setting')) {
      this.accountDetailsTab = this._routeParam.snapshot.queryParamMap.get('setting');
    }
  }

  ngAfterViewChecked(){
    if (this._routeParam.snapshot.queryParamMap.has('setting')) {
      this.accountDetailsTab = this._routeParam.snapshot.queryParamMap.get('setting');
    }
    this.cdr.detectChanges();
 }


  ngOnInit(): void {

  }


  @ViewChild('account') account!: ElementRef;
  @ViewChild('refer') refer!: ElementRef;
  @ViewChild('profilePreferencesSetting') profilePreferencesSetting!: ElementRef;
  @ViewChild('settingSecure') settingSecure!: ElementRef;
  tabName: string = '';
  openTabOnClick() {
    debugger
    // if (this.accountDetailsTab == 'accountDetails') {
    //   this.account.nativeElement.click();
    // } else if (this.accountDetailsTab == 'security') {
    //   this.settingSecure.nativeElement.click();
    // } else if (this.accountDetailsTab == 'profilePreferences') {
    //   this.profilePreferencesSetting.nativeElement.click();
    // } else if (this.accountDetailsTab == 'referralProgram') {
    //   this.refer.nativeElement.click();
    // }
  }

  ngAfterViewInit() {
    // if (this._data.activeTab) {
    //   this.refer.nativeElement.click();
    // } else {
    //   this.account.nativeElement.click();

    // }
    // this.openTabOnClick();
  }


}
