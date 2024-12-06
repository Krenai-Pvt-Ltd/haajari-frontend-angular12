import { Component, OnInit } from '@angular/core';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  requestModal: boolean = false;
  
  constructor(private roleService: RoleBasedAccessControlService) { }

  userId: string =''
  ngOnInit(): void {
    const userUuidParam = new URLSearchParams(window.location.search).get('userId');
    this.userId = userUuidParam?.toString() ?? ''

    this.getRole();

  }

  ROLE: any;
  async getRole(){
    this.ROLE = await this.roleService.getRole();
  }

}
