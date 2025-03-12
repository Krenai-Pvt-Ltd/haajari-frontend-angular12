import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { Employee } from 'src/app/payroll-models/Employee';
import { PayrollTodoStep } from 'src/app/payroll-models/PayrollTodoStep';
import { TaxDetail } from 'src/app/payroll-models/TaxDetail';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollConfigurationService } from 'src/app/services/payroll-configuration.service';
import { TaxSlabService } from 'src/app/services/tax-slab.service';

@Component({
  selector: 'app-taxes',
  templateUrl: './taxes.component.html',
  styleUrls: ['./taxes.component.css']
})
export class TaxesComponent implements OnInit {

  activeTab:string=''
  allCompleted = false;


  constructor(private _payrollConfigurationService : PayrollConfigurationService,
    private _helperService:HelperService,
    private _route:ActivatedRoute,
    private router: Router
  ) { 
    this._route.queryParams.subscribe(params => {
      this.activeTab = params['tab'] ; 
    });
  }

  ngOnInit(): void {
    window.scroll(0,0);
    this.getTaxDetail();
    this.getEmployee();
    this.getTodoList();
    
  }

  @ViewChild('taxForm') taxForm!: NgForm;
  

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
          this._helperService.showToast("Your organization tax details has been updated successfully.", Key.TOAST_STATUS_SUCCESS);
          this.taxForm.form.markAsUntouched();
        }else{
          this._helperService.showToast("Error in saving your tax details.", Key.TOAST_STATUS_ERROR);
        }
        this.saveLoader = false;
      //   setTimeout(() => {
      //     this.route('pay-schedule');
      // }, 2000);
      },
      (error) => {
        this.saveLoader = false;
        this._helperService.showToast("Error in saving your tax details.", Key.TOAST_STATUS_ERROR);

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

  toDoStepList:PayrollTodoStep[]=new Array();
   getTodoList() {

      this._payrollConfigurationService.getTodoList().subscribe(
        (response) => {
          if(response.status){
            this.toDoStepList = response.object;
            this.checkAllCompleted();

          }
        },
        (error) => {
  
        }
      );
    }
    checkAllCompleted(): boolean {
      return this.toDoStepList.every(step => step.completed);
    }

    currentTab: any= 'profile';
    route(tabName: string) {
      this.router.navigate(['/payroll/configuration'], {
        queryParams: { tab: tabName },
      });
      this.currentTab=tabName;
    }


}
