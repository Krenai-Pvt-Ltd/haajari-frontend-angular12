import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  requestModal: boolean = false;
  usersWithUpcomingBirthdays: any;

  constructor(private dataService: DataService,private roleService: RoleBasedAccessControlService) { }


  userId: string =''
  ngOnInit(): void {
    const userUuidParam = new URLSearchParams(window.location.search).get('userId');
    this.userId = userUuidParam?.toString() ?? ''

    this.getRole();
    this.getUsersWithUpcomingBirthdays();
    this.getNewUsersJoinies();
    this.getUsersUpcomingWorkAnniversaries();
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

}
