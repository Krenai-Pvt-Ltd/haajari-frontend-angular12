import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { ActivatedRoute } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { UserNotificationService } from 'src/app/services/user-notification.service';
import { Notification } from 'src/app/models/Notification';


@Component({
  selector: 'app-announcement-notification',
  templateUrl: './announcement-notification.component.html',
  styleUrls: ['./announcement-notification.component.css']
})
export class AnnouncementNotificationComponent implements OnInit {


  databaseHelper: DatabaseHelper = new DatabaseHelper();
  userId: any;
  currentUserUuid: any
  Math = Math;

  constructor(private _notificationService: UserNotificationService,
    private helperService:HelperService,
    private db: AngularFireDatabase,
    private activateRoute: ActivatedRoute,
    public rbacService: RoleBasedAccessControlService,) { }

  ngOnInit(): void {
    this.getUuids();
    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }
    this.currentUserUuid = this.rbacService.getUuid();
    this.getMailNotification(this.userId, 'mail');

  }

  reload(notificationType: string): void {
    this.fetchNotification(notificationType);
  }

  mailList: Notification[] = new Array();
  totalMailNotification: number = 0;
  mailLoading: boolean = false;
  totalNewMailNotification: number = 0;
  notificationList: Notification[] = new Array();
  getMailNotification(uuid: any, notificationType: string) {
    debugger;
    this.mailLoading = true;
    this._notificationService
      .getMailNotification(uuid, this.databaseHelper, notificationType)
      .subscribe((response) => {
        if (response.status) {
          this.mailList = response.object;
          this.totalNewMailNotification =
            response.object[0].newNotificationCount;
          this.totalMailNotification = response.totalItems;
          this.mailLoading = false;
        }
        this.mailLoading = false;
      });
  }

  readNotification(mail: any){
    if(!mail.isRead){
      this._notificationService.readNotification(mail.id).subscribe((response) => {
        if (response.status) {
          this.getMailNotification(this.userId, 'mail');
        }
      });
    }
  }

  fetchNotification(notificationType: string) {
    debugger;
    this.mailList = [];
    this.notificationList = [];
    this.databaseHelper.currentPage = 1;
    if (notificationType == 'mail') {
      this.getMailNotification(this.userId, notificationType);
    } else {
      // this.getNotification(this.orgUuid, this.UUID, notificationType);
    }
  }

  // markAsReadAll(notificationType: string) {
  //   debugger;
  //   this._notificationService
  //     .readAllNotification(this.UUID, notificationType)
  //     .subscribe((response) => {
  //       if (response.status) {
  //         this.getNotification(this.orgUuid, this.UUID, notificationType);
  //       }
  //     });
  // }

  markMailAsReadAll(notificationType: string) {
    debugger;
    this._notificationService
      .readAllNotification(this.userId, notificationType)
      .subscribe((response) => {
        if (response.status) {
          this.getMailNotification(this.UUID, notificationType);
        }
      });
  }

  UUID: any;
  orgUuid: any;
  employeeProfileRoute : string = '';
  async getUuids() {
    this.UUID = await this.rbacService.getUUID();
    this.employeeProfileRoute = `${Key.EMPLOYEE_PROFILE_ROUTE}?userId=${this.UUID}`;
    // this.employeeProfileRoute = Key.EMPLOYEE_PROFILE_ROUTE +'?userId={{UUID}}';
    this.orgUuid = await this.rbacService.getOrgRefUUID();
    this.getFirebase(this.orgUuid, this.UUID);
  }

  totalNotification: number = 0;
  loading: boolean = false;
  totalNewNotification: number = 0;
  // getNotification(orgUuid: any, uuid: any, notificationType: string) {
  //   debugger;
  //   this.loading = true;
  //   this._notificationService
  //     .getNotification(orgUuid, uuid, this.databaseHelper, notificationType)
  //     .subscribe((response) => {
  //       if (response.status) {
  //         this.notificationList = [
  //           ...this.notificationList,
  //           ...response.object,
  //         ];
  //         this.totalNewNotification = response.object[0].newNotificationCount;
  //         this.totalNotification = response.totalItems;
  //         this.loading = false;
  //       }
  //       this.loading = false;
  //     });
  // }

  newNotiication: boolean = false;
  getFirebase(orgUuid: any, userUuid: any) {
    this.db
      .object(
        'user_notification' +
          '/' +
          'organization_' +
          orgUuid +
          '/' +
          'user_' +
          userUuid
      )
      .valueChanges()
      .subscribe(async (res) => {
        //@ts-ignore
        if (res?.flag != undefined && res?.flag != null) {
          //@ts-ignore
          this.newNotiication = res?.flag == 1 ? true : false;
        }
      });
  }

  formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      date = new Date(date);
    }

    const now = new Date();

    if (isNaN(date.getTime())) {
      console.error("Invalid date:", date);
      return 'Invalid Date';
    }

    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return 'Just Now';
    }

    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
    });
  }

  pageChanged(page: number): void {
    this.databaseHelper.currentPage = page;
    this.getMailNotification(this.userId, 'mail');
  }



}
