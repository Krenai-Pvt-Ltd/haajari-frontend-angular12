import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-payroll-managements',
  templateUrl: './payroll-managements.component.html',
  styleUrls: ['./payroll-managements.component.css']
})
export class PayrollManagementsComponent implements OnInit {

  constructor() { 
    
  }


  isLoading = true;

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

  stats = [
    {
      title: 'Employees',
      value: 258,
      sub: '+ 18',
      subClass: 'text-success',
      subFont: 'font-12'
    },
    {
      title: 'Calendar Days',
      value: 30,
      sub: null,
      subClass: '',
      subFont: ''
    },
    {
      title: 'Payroll',
      value: '0/236',
      sub: 'Employees',
      subClass: 'text-muted',
      subFont: 'font-10'
    }
  ];

  tdsItems = [
    { label: 'TDS (Mar ₹0)', amount: 53000 },
    { label: 'EPF (Mar ₹0)', amount: 88000 },
    { label: 'EPFC (Mar ₹0)', amount: 99000 },
    { label: 'EESI (Mar ₹0)', amount: 15000 },
    { label: 'EESIC (Mar ₹0)', amount: 9000 },
    { label: 'NEPAY (Mar ₹0)', amount: 8000 }
  ];

  months = [
    { title: 'Jan-2025', range: '01 Jan - 31 Jan', status: 'Pending', statusClass: 'text-warning' },
    { title: 'Feb-2025', range: '01 Feb - 28 Feb', status: 'Completed', statusClass: 'text-success' },
    { title: 'Mar-2025', range: '01 Mar - 31 Mar', status: 'Completed', statusClass: 'text-success' },
    { title: 'Apr-2025', range: '01 Apr - 30 Apr', status: 'Current', statusClass: 'text-primary' },
    { title: 'May-2025', range: '01 May - 30 May', status: 'Upcoming', statusClass: 'text-muted' },
    { title: 'Jun-2025', range: '01 Jun - 30 Jun', status: 'Upcoming', statusClass: 'text-muted' },
    { title: 'July-2025', range: '01 July - 30 July', status: 'Upcoming', statusClass: 'text-muted' },
    { title: 'August-2025', range: '01 August - 30 August', status: 'Upcoming', statusClass: 'text-muted' },
    { title: 'Ste-2025', range: '01 Ste - 30 Ste', status: 'Upcoming', statusClass: 'text-muted' },
    { title: 'Oct-2025', range: '01 Oct - 30 Oct', status: 'Upcoming', statusClass: 'text-muted' },
    { title: 'Nov-2025', range: '01 Nov - 30 Nov', status: 'Upcoming', statusClass: 'text-muted' },
    { title: 'Dec-2025', range: '01 Dec - 30 Dec', status: 'Upcoming', statusClass: 'text-muted' },
    // etc...
  ];

  expenses = [
    {
      label: 'Travel & Transportation',
      percentage: 20,
      value: '87%',
      class: 'earned-leave'
    },
    {
      label: 'Employee Reimbursements',
      percentage: 18,
      value: '87%',
      class: 'casual-leave'
    },
    {
      label: 'Office & Administration',
      percentage: 11,
      value: '87%',
      class: 'sick-leave'
    },
    {
      label: 'Client Engagement & Entertainment',
      percentage: 9,
      value: '87%',
      class: 'maternity-leave'
    }
  ];
  payrolls = [
    {
      title: 'March Payroll',
      admin: 'Prachi Bansal',
      date: 'April 12th, 2025, 12:30:10 PM'
    },
    {
      title: 'February Payroll',
      admin: 'Rohit Mehra',
      date: 'March 10th, 2025, 11:15:00 AM'
    },
    {
      title: 'January Payroll',
      admin: 'Ananya Singh',
      date: 'Feb 8th, 2025, 10:00:00 AM'
    },
    {
      title: 'January Payroll',
      admin: 'Ananya Singh',
      date: 'Feb 8th, 2025, 10:00:00 AM'
    },
    {
      title: 'January Payroll',
      admin: 'Ananya Singh',
      date: 'Feb 8th, 2025, 10:00:00 AM'
    },
    {
      title: 'January Payroll',
      admin: 'Ananya Singh',
      date: 'Feb 8th, 2025, 10:00:00 AM'
    },
    {
      title: 'January Payroll',
      admin: 'Ananya Singh',
      date: 'Feb 8th, 2025, 10:00:00 AM'
    },
    {
      title: 'January Payroll',
      admin: 'Ananya Singh',
      date: 'Feb 8th, 2025, 10:00:00 AM'
    },
    {
      title: 'January Payroll',
      admin: 'Ananya Singh',
      date: 'Feb 8th, 2025, 10:00:00 AM'
    },
    {
      title: 'January Payroll',
      admin: 'Ananya Singh',
      date: 'Feb 8th, 2025, 10:00:00 AM'
    },
    // ...add more entries as needed
  ];

  
  }

