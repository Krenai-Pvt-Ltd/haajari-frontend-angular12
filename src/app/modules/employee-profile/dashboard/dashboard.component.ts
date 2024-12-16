import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  requestModal: boolean = false;
  usersWithUpcomingBirthdays: any;

  resignationSubmittedSubscriber: any;
  resignationSubmittedToggle: boolean = false;
  constructor(private roleService: RoleBasedAccessControlService, private dataService: DataService, public helperService: HelperService) { 
    this.resignationSubmittedSubscriber =  this.helperService.resignationSubmitted.subscribe((value)=>{
      if(value){
        this.resignationSubmittedToggle = true;
        this.getUserResignationInfo();
      }else{
        this.resignationSubmittedToggle = false;
      }
    });
  }

  ngOnDestroy(){
    this.resignationSubmittedSubscriber.complete();
  }

  userId: string =''
  ngOnInit(): void {
    const userUuidParam = new URLSearchParams(window.location.search).get('userId');
    this.userId = userUuidParam?.toString() ?? ''

    this.getRole();
    this.getUserResignationInfo();
    this.getUsersWithUpcomingBirthdays();
    this.getNewUsersJoinies();
    this.getUsersUpcomingWorkAnniversaries();
    // this.getWorkedHourForEachDayOfAWeek();

  }





getUsersWithUpcomingBirthdays(): void {
  this.dataService.getUsersWithUpcomingBirthdays().subscribe(
    (data) => {
      this.usersWithUpcomingBirthdays = data;
    },
    (error) => {
      console.error('Error fetching upcoming birthdays:', error);
    }
  );
}
anniversaries: any;
getUsersUpcomingWorkAnniversaries(): void {
  this.dataService.getRecentlyWorkAnniversary().subscribe(
    (data) => {
      this.anniversaries = data;
    },
    (error) => {
      console.error('Error fetching upcoming anniversary:', error);
    }
  );
}
newJoiners: any;
getNewUsersJoinies(): void {
  this.dataService.getRecentlyJoinedUsers().subscribe(
    (data) => {
      this.newJoiners = data;
    },
    (error) => {
      console.error('Error fetching upcoming birthdays:', error);
    }
  );
}

isToday(birthday: string): boolean {
  const today = new Date();
  const birthdayDate = new Date(birthday);
  return today.getDate() === birthdayDate.getDate() && today.getMonth() === birthdayDate.getMonth();
}
getWeekDayOfBirthday(birthday: string): string {
  const currentYear = new Date().getFullYear();
  const [month, day] = birthday.split('-'); // Assuming 'MM-dd' format in the backend
  const birthdayDate = new Date(currentYear, parseInt(month) - 1, parseInt(day));
  // Get the weekday name (e.g., "Monday", "Tuesday", etc.)
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return weekdays[birthdayDate.getDay()];
}
  ROLE: any;
  async getRole(){
    this.ROLE = await this.roleService.getRole();
  }

  userResignationInfo: any;
  discussionType: string = 'Yes'
  recommendDay: string = 'Complete'
  getUserResignationInfo(){
    this.userResignationInfo = []
    this.dataService.getUserResignationInfo(this.userId).subscribe((res: any) => {
      if(res.status){
        this.userResignationInfo = res.object[0]

        if(this.userResignationInfo.isManagerDiscussion == 0){
          this.discussionType = 'No'
        }

        if(this.userResignationInfo.isRecommendedLastDay == 1){
          this.recommendDay = 'Other'
        }

        console.log('userResignationInfo dashboard : ',this.userResignationInfo)
      }
    })
  }

  @ViewChild('closeApproveModal') closeApproveModal!: ElementRef
  approveToggle: boolean = false
  hideResignationModal: boolean = false;
  approveOrDenyResignation(id: number) {

    debugger
    this.approveToggle = true;
    this.hideResignationModal = true;

    this.dataService.updateResignation(id).subscribe((res: any) => {
      if(res.status){
        this.closeApproveModal.nativeElement.click()
        this.approveToggle = false
        this.helperService.profileChangeStatus.next(true);
        this.helperService.showToast(
          res.message,
          Key.TOAST_STATUS_SUCCESS
        );
      }else{
        this.approveToggle = false;
      }
    })

  }

  getDynamicClass(index: number): object {
    if(index>=3){
      var mod = index % 3;
      return { [`birthday-box-${mod}`]: true };
    }else{
      return { [`birthday-box-${index}`]: true };
    }
  }


// new 

@ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;


getWorkedHourForEachDayOfAWeek() {
  this.dataService.getWorkedHourForEachDayOfAWeek(this.userId).subscribe(
    (response: any) => {
      const labels = response.listOfObject.map((item: any) =>
        this.formatDate(item.workDate)
      );
      const data = response.listOfObject.map((item: any) =>
        this.formatToDecimalHours(item.totalWorkedHour)
      );

      this.initializeChart(labels, data);
    },
    (error) => {
      console.error('Error fetching user count by status:', error);
    }
  );
}

  formatToDecimalHours(time: string): number {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours + minutes / 60 + seconds / 3600;
  }

  formatDate(date: string): string {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
    return new Date(date).toLocaleDateString('en-US', options);
  }

  initializeChart(labels: string[], data: number[]) {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');

    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Total Worked Hours',
              data: data,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Days of the Week',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Hours Worked',
              },
              beginAtZero: true,
            },
          },
        },
      });
    }
  }

  // @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  // chart!: Chart;

  // ngAfterViewInit() {
  //   this.initializeChart(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [8, 7, 8, 6, 7, 8, 5]);
  // }

  // formatDate(date: string): string {
  //   const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
  //   return new Date(date).toLocaleDateString('en-US', options);
  // }

  // initializeChart(labels: string[], data: number[]) {
  //   const ctx = this.chartCanvas.nativeElement.getContext('2d');

  //   if (ctx) {
  //     this.chart = new Chart(ctx, {
  //       type: 'line',
  //       data: {
  //         labels: labels,
  //         datasets: [
  //           {
  //             label: 'Total Worked Hours',
  //             data: data,
  //             borderColor: 'rgba(75, 192, 192, 1)',
  //             backgroundColor: 'rgba(75, 192, 192, 0.2)',
  //             tension: 0.4,
  //           },
  //         ],
  //       },
  //       options: {
  //         responsive: true,
  //         plugins: {
  //           legend: {
  //             display: true,
  //             position: 'top',
  //           },
  //         },
  //         scales: {
  //           x: {
  //             title: {
  //               display: true,
  //               text: 'Days of the Week',
  //             },
  //           },
  //           y: {
  //             title: {
  //               display: true,
  //               text: 'Hours',
  //             },
  //           },
  //         },
  //       },
  //     });
  //   }
  // }

  

}
