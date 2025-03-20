import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-payroll-management',
  templateUrl: './payroll-management.component.html',
  styleUrls: ['./payroll-management.component.css']
})
export class PayrollManagementComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  employees = [
    {
      name: 'Leslie Alexander',
      paidDays: 31,
      grossPay: 50467,
      deductions: 0,
      taxes: 0,
      benefits: 5031,
      reimbursements: 0,
      netPay: 75031,
      selected: false
    },
    {
      name: 'John Doe',
      paidDays: 30,
      grossPay: 60000,
      deductions: 2000,
      taxes: 3000,
      benefits: 4000,
      reimbursements: 1000,
      netPay: 62000,
      selected: false
    },
    {
      name: 'Jane Cooper',
      paidDays: 30,
      grossPay: 60000,
      deductions: 2000,
      taxes: 3000,
      benefits: 4000,
      reimbursements: 1000,
      netPay: 62000,
      selected: false
    },
    {
      name: 'Marvin McKinney',
      paidDays: 30,
      grossPay: 60000,
      deductions: 2000,
      taxes: 3000,
      benefits: 4000,
      reimbursements: 1000,
      netPay: 62000,
      selected: false
    },
    {
      name: 'Jerome Bell',
      paidDays: 30,
      grossPay: 60000,
      deductions: 2000,
      taxes: 3000,
      benefits: 4000,
      reimbursements: 1000,
      netPay: 62000,
      selected: false
    }
  ];

  selectAll = false;
  showPayrollDetail: boolean = false;

  toggleAllSelection() {
    this.employees.forEach(emp => emp.selected = this.selectAll);
  }

  togglePolicyList() {
    this.showPayrollDetail = !this.showPayrollDetail;
  }

  payrollData: any[] = [
    { paymentDate: '3rd May 2025', payrollType: 'Off Cycle Payroll', details: '3rd May 2025 - 4th May 2025', paymentState: 'Paid on 03/04/2025' },
    { paymentDate: '12th May 2025', payrollType: 'Off Cycle Payroll', details: '3rd May 2025 - 4th May 2025', paymentState: 'Paid on 03/04/2025' },
    { paymentDate: '22nd May 2025', payrollType: 'Regular Payroll', details: '3rd May 2025 - 4th May 2025', paymentState: 'Paid on 03/04/2025' },
    { paymentDate: '23rd May 2025', payrollType: 'Off Cycle Payroll', details: '3rd May 2025 - 4th May 2025', paymentState: 'Paid on 03/04/2025' },
    { paymentDate: '26th May 2025', payrollType: 'Regular Payroll', details: '3rd May 2025 - 4th May 2025', paymentState: 'Paid on 03/04/2025' }
  ];
}

