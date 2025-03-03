import { Component, OnInit } from '@angular/core';
import { Key } from 'src/app/constant/key';
import { EmployeeProvidentFund } from 'src/app/payroll-models/EmployeeProvidentFund';
import { PfContributionRate } from 'src/app/payroll-models/PfContributioRate';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollConfigurationService } from 'src/app/services/payroll-configuration.service';

@Component({
  selector: 'app-statutory',
  templateUrl: './statutory.component.html',
  styleUrls: ['./statutory.component.css']
})
export class StatutoryComponent implements OnInit {


  constructor(private _payrollConfigurationService : PayrollConfigurationService, 
    private _helperService : HelperService) {}

  ngOnInit(): void {
    this.getEpfDetail();
    this.getPfContribution();
    }

  epfDetail:EmployeeProvidentFund = new EmployeeProvidentFund();
  getEpfDetail(){
      this._payrollConfigurationService.getEpfDetail().subscribe(
        (response) => {
          if(response.status){
            this.epfDetail= response.object;
            if(this.epfDetail==null){
              this.epfDetail = new EmployeeProvidentFund();
            }
          }
        },
        (error) => {
  
        }
      );
    }


    pfContributionRate:PfContributionRate [] = new Array();
      getPfContribution(){
        this._payrollConfigurationService.getPfContribution().subscribe(
          (response) => {
            if(response.status){
              this.pfContributionRate = response.object;
                 
            }
            if(this.pfContributionRate == null){
              this.pfContributionRate = [];
            }
          },
          (error) => {
          }
        );
      }

      get filteredEmployerContributions(): PfContributionRate[] {
        return this.pfContributionRate.filter(pf => pf.contributorType === 1);
      }
      get filteredEmployeeContributions(): PfContributionRate[] {
        return this.pfContributionRate.filter(pf => pf.contributorType === 2);
      }
    

      selectedPfWage(id: number) {
        this.epfDetail.employerContribution = id;

          if (id === 1) {
            this.epfDetail.employeeContribution = 3;
        } 
      }
    
    saveLoader:boolean=false;
      saveEpfDetail(){
        this.saveLoader = true;
        this.epfDetail =  this.transformBooleansToNumbers(this.epfDetail);
        this._payrollConfigurationService.saveEpfDetail(this.epfDetail).subscribe(
          (response) => {
            if(response.status){
              this._helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
            }else{
              this._helperService.showToast(response.message, Key.TOAST_STATUS_ERROR);
            }
            this.saveLoader = false;
          },
          (error) => {
            this.saveLoader = false;
          }
        );
      }

      private transformBooleansToNumbers(obj: any): any {
        let transformedObj = { ...obj };
        Object.keys(transformedObj).forEach(key => {
          if (typeof transformedObj[key] === "boolean") {
            transformedObj[key] = transformedObj[key] ? 1 : 0;
          }
        });
        return transformedObj;
      }
}
