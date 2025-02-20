import { Component, HostListener, OnInit } from '@angular/core';
import { DatabaseHelper } from 'src/app/models/DatabaseHelper';
import { DataService } from 'src/app/services/data.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { UserNotificationService } from 'src/app/services/user-notification.service';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.css']
})
export class InboxComponent implements OnInit {

  constructor(private _notificationService: UserNotificationService,
    public rbacService: RoleBasedAccessControlService,
    private dataService: DataService,
  ) { }

  ngOnInit(): void {
    this.getUuids();
  }

  mails: any[] = [];
  loading: boolean = false;
  finished: boolean = false;

  onScroll(event: any): void {
    const element = event.target;

    if (element.scrollHeight - element.scrollTop-20 <= element.clientHeight) {
      this.fetchMails();
    }
  }

  pageNumber: number = 0;
  pageSize: number = 15;
  currentMail: any;
  fetchMails(): void {
    if (this.loading || this.finished) {
      return;
    }
    this.loading = true;
    this._notificationService
      .getMail('mail', this.UUID, this.UUID, '', '', this.pageNumber, this.pageSize)
      .subscribe(
        (response) => {
          this.mails = [...this.mails, ...response.object.content]; // Assuming the response contains 'content' for pagination
          this.loading = false;
          if(response.object.totalPages-1 == this.pageNumber){
            this.finished = true;
          }
          if(this.pageNumber == 0){
            this.currentMail = this.mails[0];
          }
          this.pageNumber++;
        },
        (error) => {

        }
      );
  }
  openMail(mail: any): void {
    this.currentMail = mail;
    this.showAssetComponent=false;
    this.showExitComponent=false;
    this.isProfileReqModalOpen=false;
    this.onMessageClick(mail);
  }

  databaseHelper: DatabaseHelper = new DatabaseHelper();

    UUID: any;
    orgUuid: any;
    async getUuids() {
      this.UUID = await this.rbacService.getUUID();
      this.orgUuid = await this.rbacService.getOrgRefUUID();
      this.fetchNotification('mail');
      this.fetchMails();
    }

    fetchNotification(notificationType: string) {
      debugger;
      this.mailList = [];
      this.databaseHelper.currentPage = 1;
      this.getMailNotification( notificationType);

    }

   mailList: Notification[] = new Array();
    totalMailNotification: number = 0;
    mailLoading: boolean = false;
    totalNewMailNotification: number = 0;
    getMailNotification( notificationType: string) {
      debugger;
      this.mailLoading = true;
      this._notificationService
        .getMailNotification(this.UUID, this.databaseHelper, notificationType)
        .subscribe((response) => {
          if (response.status) {
            this.mailList = [...this.mailList, ...response.object];
            this.totalNewMailNotification =
              response.object[0].newNotificationCount;
            this.totalMailNotification = response.totalItems;
            this.mailLoading = false;
          }
          this.mailLoading = false;
        });
    }

     @HostListener('window:scroll', ['$event'])
      onMailScroll(event: any) {
        if (
          event.target.offsetHeight + event.target.scrollTop >=
          event.target.scrollHeight - 5
        ) {
          if (
            this.mailList.length < this.totalNewMailNotification &&
            !this.mailLoading &&
            this.databaseHelper.currentPage <=
              this.totalNewMailNotification / this.databaseHelper.itemPerPage
          ) {
            this.databaseHelper.currentPage++;
            this.getMailNotification('mail');
          }
        }
      }


  showExitComponent = false;
  exitData: any;

  showAssetComponent = false;
  assetData: any;

  isProfileReqModalOpen: boolean = false;
  requestModalData: any = {};

  isAnyModalOpen(): boolean{
    return this.showExitComponent || this.showAssetComponent || this.isProfileReqModalOpen;
  }

  onProfileComponentClose() {
    this.isProfileReqModalOpen = false;
  }

  onExitComponentClose() {
    console.log('Exit component close');
    this.showExitComponent = false;

  }
  onAssetComponentClose() {
    this.showAssetComponent = false;
  }

  readNotification(mail: any){
    if(!mail.isRead ){
      this._notificationService.readNotification(mail.id).subscribe((response) => {
        if (response.status) {
          mail.isRead = true;
        }
      });
    }
  }
  onMessageClick(mail:any) {
    this.readNotification(mail);
    if(mail.categoryId === 80 || mail.categoryId === 81) {
      this.showExitComponent = false;
      this.exitData = {};
      this.exitData.id = mail.resourceId;
      this.exitData.userType = 'ADMIN';
      this.exitData.isModal = 0;
      setTimeout(() => {
        this.showExitComponent = true;
      } , 1);
    }else if(mail.categoryId === 40 || mail.categoryId === 50) {
      this.showAssetComponent = false;
      this.assetData = {};
      this.assetData.id = mail.resourceId;
      this.assetData.userType = 'ADMIN';
      this.assetData.isModal = 0;
      this.getAssetRequestById(mail.resourceId);
    }else if(mail.categoryId === 13) {
      this.isProfileReqModalOpen = false;
      this.requestModalData = {};
      this.requestModalData.id = mail.resourceId;
      this.requestModalData.uuid = '';
      this.requestModalData.userType = 'ADMIN';
      this.requestModalData.isModal = 0;
      setTimeout(() => {
        this.isProfileReqModalOpen = true;
      } , 1);
    }
    else{
      this.showExitComponent = false;
      this.showAssetComponent = false;
      this.isProfileReqModalOpen = false;
    }
  }

  isLoadingData: boolean = false;
  assetRequest: any;
  getAssetRequestById(id: number): void {
    this.isLoadingData = true;
    this.dataService.getAssetRequestByID(id).subscribe(
      (data) => {
        this.assetRequest = data;
        this.assetData.asset=this.assetRequest;

        setTimeout(() => {
        this.showAssetComponent = true;
        this.isLoadingData = false;
        }, 10);
      },
      (error) => {
        this.isLoadingData = false;
        console.error('Error fetching asset request:', error);
      }
    );
  }
}


