import { Component, Input, OnInit } from '@angular/core';
import { Validator } from '@angular/forms';
import { Key } from 'src/app/constant/key';
import { Employee } from 'src/app/payroll-models/Employee';
import { TaxDetail } from 'src/app/payroll-models/TaxDetail';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollConfigurationService } from 'src/app/services/payroll-configuration.service';

@Component({
  selector: 'app-taxes',
  templateUrl: './taxes.component.html',
  styleUrls: ['./taxes.component.css']
})
export class TaxesComponent implements OnInit {

  constructor(private _payrollConfigurationService : PayrollConfigurationService,
    private _helperService:HelperService
  ) { }

  ngOnInit(): void {
    this.getTaxDetail();
    this.getEmployee();
  }


  taxDetail:TaxDetail = new TaxDetail();
  getTaxDetail(){
    this._payrollConfigurationService.getTaxDetail().subscribe(
      (response) => {
        if(response.status){
          this.taxDetail= response.object;
          if(this.taxDetail==null){
            this.taxDetail = new TaxDetail();
          }
        }
      },
      (error) => {

      }
    );
  }

  saveLoader:boolean=false;
  saveTaxDetail(){
    this.saveLoader = true;
    this._payrollConfigurationService. saveTaxDetail(this.taxDetail).subscribe(
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

  employees:Employee [] = new Array();
  employeenameList: string[] = [];
  getEmployee(){
    this._payrollConfigurationService.getEmployee().subscribe(
      (response) => {
        if(response.status){
          this.employees= response.object;
        
        }
      },
      (error) => {

      }
    );
  }

 
  clearDeductorDetail() {
    this.taxDetail.deductorName='';
    this.taxDetail.fatherName='';
    this.taxDetail.designation='';
  }

  selectedEmployee(uuid:any){

    const selectedEmp = this.employees.find(emp => emp.uuid === uuid);
    if(selectedEmp){
      this.taxDetail.fatherName = selectedEmp.fatherName?selectedEmp.fatherName:'';
      this.taxDetail.designation = selectedEmp.designation? selectedEmp.designation :'';
    }

  }


}
