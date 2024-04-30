import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HelperService } from 'src/app/services/helper.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-logout-confirmation-modal',
  templateUrl: './logout-confirmation-modal.component.html',
  styleUrls: ['./logout-confirmation-modal.component.css'],
})
export class LogoutConfirmationModalComponent implements OnInit {
  constructor(
    public activeModal: NgbActiveModal,
    private router: Router,
    private helperService: HelperService,
    private rbacService: RoleBasedAccessControlService,
  ) {}

  ngOnInit(): void {}

  close() {
    this.activeModal.dismiss();
  }

  confirmLogout() {
    // Implement your logout logic here
    this.activeModal.close();
    // localStorage.clear();
    this.logoutFunction();
    // this.router.navigate(['/login']);
  }

  logoutFunction() {
    localStorage.clear();
    this.rbacService.clearRbacService();
    this.helperService.clearHelperService();
    this.router.navigate(['/login']);
  }
}
