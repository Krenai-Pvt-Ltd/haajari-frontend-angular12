import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css']
})
export class EmployeeProfileComponent implements OnInit {

  userId: any;
  currentUserUuid: any

  constructor(private activateRoute: ActivatedRoute,
    public rbacService: RoleBasedAccessControlService,
  ) { }

  ngOnInit(): void {
    if (this.activateRoute.snapshot.queryParamMap.has('userId')) {
      this.userId = this.activateRoute.snapshot.queryParamMap.get('userId');
    }
    this.currentUserUuid = this.rbacService.getUuid();
  }

  isEmployeeExit: boolean = false;

}
