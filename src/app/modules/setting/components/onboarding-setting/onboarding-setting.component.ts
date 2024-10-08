import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OnboardingModule } from 'src/app/models/OnboardingModule';
import { Role } from 'src/app/models/role';
import { DataService } from 'src/app/services/data.service';
import { HelperService } from 'src/app/services/helper.service';
@Component({
  selector: 'app-onboarding-setting',
  templateUrl: './onboarding-setting.component.html',
  styleUrls: ['./onboarding-setting.component.css']
})
export class OnboardingSettingComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private helperService: HelperService,
    private router: Router,
    private activateRoute: ActivatedRoute
  ) {}

  roles: Role[] = [];
  onboardingModules: OnboardingModule[] = [];

  itemPerPage: number = 9;
  pageNumber: number = 1;
  pageNumberUser: number = 1;

  ngOnInit(): void {
    this.getAllRolesMethodCall();
    this.fetchOnboardingModules();
    this.dataService.getEnabledModuleIds()
      .subscribe((enabledIds: number[]) => {
        // Update the isFlag property of the modules based on the fetched enabled IDs
        this.onboardingModules.forEach(module => {
          module.isFlag = enabledIds.includes(module.id);
        });
      }, error => {
        console.error('Error fetching enabled modules:', error);
      });
  }
  getAllRolesMethodCall() {
    this.dataService
      .getAllRoles(
        this.itemPerPage,
        this.pageNumberUser,
        'asc',
        'id',
        '',
        '',
        0
      )
      .subscribe(
        async (data) => {
          this.roles = data.object;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  fetchOnboardingModules(): void {
    this.dataService.getAllOnboardingModules().subscribe(
      (data) => {
        this.onboardingModules = data;
      },
      (error) => {
        console.error('Error fetching onboarding modules:', error);
      }
    );
  }
  onModuleSelect(index: number, event: any) {
    this.onboardingModules[index].isFlag = event.target.checked;
  }

  onSave() {

    const selectedModuleIds = this.onboardingModules
      .filter(module => module.isFlag)
      .map(module => module.id);


    this.dataService.saveSelectedModuleIds(selectedModuleIds)
      .subscribe(response => {
        console.log('Modules saved:', response);
      }, error => {
        console.error('Error saving modules:', error);
      });
  }


}

