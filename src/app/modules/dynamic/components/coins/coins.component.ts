import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AllocateCoinsRoleWiseRequest, AllocateCoinsRoleWiseResponse, RolesForSuperCoinsResponse } from 'src/app/models/allocate-coins-role-wise-request';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-coins',
  templateUrl: './coins.component.html',
  styleUrls: ['./coins.component.css']
})
export class CoinsComponent implements OnInit {

  allocateCoinsForm: FormGroup;
  constructor(private fb: FormBuilder, private dataService:DataService) { 
    this.allocateCoinsForm = this.fb.group({
      allocatedCoins: ['', Validators.required],
      donateLimitForManager: [''],
      donateLimitForUser: [''],
      donateLimitForTeamMates: [''],
      roleId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getRolesData();
    this.loadRoleWiseAllocatedCoins();
  }

  roles: RolesForSuperCoinsResponse[] = [];
  getRolesData() {
    this.dataService.getRoles().subscribe(
      data => {
        this.roles = data.listOfObject;
      },
      error => {
        console.error("Error fetching roles", error);
      }
    );
  }

  onSubmit() {
    debugger
    if (this.allocateCoinsForm.valid) {
      const request: AllocateCoinsRoleWiseRequest = this.allocateCoinsForm.value;
      this.dataService.allocateCoinsRoleAndOrganizationWise(request).subscribe(
        response => {
          console.log("assigned successfully")
        },
        error => {
          console.error("Error allocating coins", error);
        }
      );
    }
  }

  roleWiseCoins: AllocateCoinsRoleWiseResponse[] = [];
  loadRoleWiseAllocatedCoins(): void {
    this.dataService.getRoleWiseAllocatedCoins().subscribe(data => {
      this.roleWiseCoins = data.listOfObject;
    },
    error => {
      console.error("Error fetching roles", error);
    });
  }

}
