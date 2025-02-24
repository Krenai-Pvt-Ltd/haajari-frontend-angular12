import { Component, HostListener, OnInit } from '@angular/core';
import { CompatibleDate } from 'ng-zorro-antd/date-picker';
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
  startDate:any='';
  endDate:any='';
  categoryIds: number[] = [];
  fetchMails(): void {
    if (this.loading || this.finished) {
      return;
    }
    this.loading = true;
    this._notificationService
      .getMail('mail', this.UUID, this.UUID, this.startDate, this.endDate, this.pageNumber, this.pageSize, this.categoryIds)
      .subscribe(
        (response) => {
        if(response.status){
          this.mails = [...this.mails, ...response.object.content]; // Assuming the response contains 'content' for pagination
          this.loading = false;
          if(response.object.totalPages-1 == this.pageNumber){
            this.finished = true;
          }
          if(this.pageNumber == 0){
            if(this.mails && this.mails.length>0){
              this.currentMail = this.mails[0];
            }

          }
          this.pageNumber++;
        }else{
          this.loading = false;
          this.finished = true;
          if(this.pageNumber == 0){
            this.currentMail = null;
          }

        }
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
    this.showExpenseComponent=false;
    this.onMessageClick(mail);
  }

  databaseHelper: DatabaseHelper = new DatabaseHelper();

    UUID: any;
    orgUuid: any;
    async getUuids() {
      this.UUID = await this.rbacService.getUUID();
      this.orgUuid = await this.rbacService.getOrgRefUUID();
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

  showExpenseComponent: boolean = false;
  expenseData: any= {};
  currentExpenseId: any = 0;

  showAttendanceUpdate: boolean = false;
  attendanceUpdateData: any = {};
  onExpenseComponentClose() {
    this.showExpenseComponent = false;
    this.getCompanyExpense(this.currentExpenseId);
  }


  isAnyModalOpen(): boolean{
    return this.showExitComponent || this.showAssetComponent || this.isProfileReqModalOpen || this.showExpenseComponent || this.showAttendanceUpdate;
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

  onAttendanceUpdateClose(){
    this.showAttendanceUpdate=false;
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
      this.checkPendingRequest(mail.resourceId);
    }else if(mail.categoryId === 71 || mail.categoryId === 72) {
      this.showExpenseComponent = false;
      this.expenseData = {};
      this.expenseData.id = mail.resourceId;
      this.expenseData.userType = 'ADMIN';
      this.expenseData.isModal = 0;
      this.currentExpenseId = mail.resourceId;
      this.getCompanyExpense(mail.resourceId);
    }else if(mail.categoryId === 30) {
      this.showAttendanceUpdate=false;
      this.attendanceUpdateData = {};
      this.attendanceUpdateData.id = mail.resourceId;
      this.attendanceUpdateData.userType = 'ADMIN';
      this.attendanceUpdateData.isModal = 0;
      this.getAttendanceUpdateById(mail.resourceId);
    }
    else{
      this.showExitComponent = false;
      this.showAssetComponent = false;
      this.isProfileReqModalOpen = false;
    }
  }

  getAttendanceUpdateById(id: number): void {
    this.isLoadingData = true;
    this.dataService.getAttendanceRequestById(id).subscribe(
      (data) => {
        this.isLoadingData = false;
        if (data.status) {
          this.attendanceUpdateData.attendanceRequest=data.object;
          setTimeout(() => {
            this.showAttendanceUpdate=true;
          }, 1);
        } else {

        }
      },
      (error) => {
        this.isLoadingData = false;
        console.error('Error fetching attendance update:', error);
      }
    );
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
  companyExpense: any;
  getCompanyExpense(id: number): void {
    this.isLoadingData = true;
    this.dataService.getCompanyExpenseById(id).subscribe({
      next: (response) => {
        this.isLoadingData = false;
        if (response.status) {
          this.companyExpense = response.object;
          this.expenseData.expense = this.companyExpense;
          setTimeout(() => {
            this.showExpenseComponent = true;
          }, 1);
        } else {

        }
      },
      error: (err) => {
        this.isLoadingData = false;
      }
    });
  }

  checkPendingRequest(resourceId: number) {
    this.dataService.isPendingRequest(resourceId).subscribe(response => {
      if (response.status) {
        this.requestModalData.id = response.object;
        setTimeout(() => {
          this.isProfileReqModalOpen = true;
        } , 1);
      }else{
        this.isProfileReqModalOpen = false;
      }
    }, error => {
      console.error('Error fetching pending request status:', error);
    });
  }




  selectedDate: Date | null = null;
  onDateChange(date: Date | null): void {
    if (date) {
      const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD (e.g., "2025-02-20")
      this.startDate = dateStr;

      // Increase date by 1 day for endDate
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1); // Add 1 day
      const nextDayStr = nextDay.toISOString().split('T')[0]; // Format as YYYY-MM-DD (e.g., "2025-02-21")
      this.endDate = nextDayStr;

      this.pageNumber = 0;
      this.mails = [];
      this.finished = false;
      this.fetchMails();
    } else {
      // Reset dates if cleared
      this.startDate = '';
      this.endDate = '';
      this.pageNumber = 0;
      this.mails = [];
      this.finished = false;
      this.fetchMails();
    }
  }

  activeFilter: string = 'All';
  onFilterClick(filter: any): void {
    this.activeFilter = filter.type;
    this.categoryIds = filter.ids;
    this.pageNumber = 0; // Reset pagination
    this.mails = []; // Clear existing mails
    this.finished = false;
    this.fetchMails(); // Fetch mails with new filter
  }

  filterList: any[] = [
    {
      type: "All",
      ids: [],
      svgPath: ""
    },
    {
      type: "Onboarding",
      ids: [1, 2, 3, 4],
      svgPath: "M10 10m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" // Simple circle (e.g., person’s head)
    },
    {
      type: "Profile Update",
      ids: [10, 11, 12, 13],
      svgPath: "M9 9c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" // User icon
    },
    {
      type: "Leave Request",
      ids: [20, 21, 22, 23],
      svgPath: "M17 3h-1v-1h-2v1h-6v-1h-2v1h-1c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-12c0-1.1-.9-2-2-2zm0 14h-14v-8h14v8zm0-10h-14v-2h14v2z" // Calendar icon
    },
    {
      type: "Attendance Update",
      ids: [30, 31, 32],
      svgPath: "M12 2c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm1-11h-2v6l5.25 3.15.75-1.23-4-2.67z" // Clock icon
    },
    {
      type: "Asset Request",
      ids: [40, 41, 42, 43, 50, 51, 52, 53],
      svgPath: "M3 3v14h14v-14h-14zm2 2h10v6h-10v-6zm0 8h4v2h-4v-2zm6 0h4v2h-4v-2z" // Computer monitor icon
    },
    {
      type: "Expense Request",
      ids: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72],
      svgPath: "M11 2h-2v4h-4v2h10v-2h-4v-4zm-6 8v10h14v-10h-14zm2 2h10v6h-10v-6z" // Dollar sign or receipt icon
    },
    {
      type: "Resignation",
      ids: [80, 81, 82, 83],
      svgPath: "M10 2h-2v6h-6v10h14v-10h-6v-6zm-4 8h8v6h-8v-6z" // Door icon
    },
    {
      type: "Shift Timing Changed",
      ids: [100],
      svgPath: "M12 2c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm5-5h-3v3l4-4-1-1z" // Clock with arrow
    }
  ];
}


