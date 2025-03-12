import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-salary-template',
  templateUrl: './salary-template.component.html',
  styleUrls: ['./salary-template.component.css']
})
export class SalaryTemplateComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }


    templates = [
      {
        name: 'Internship',
        date: '12th June, 2024',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien.',
        status: true
      },
      {
        name: 'Fresher',
        date: '12th June, 2024',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. ',
        status: false
      },
      {
        name: 'SDE 1',
        date: '12th June, 2024',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien.',
        status: true
      },
      {
        name: 'SDE 2',
        date: '12th June, 2024',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien.',
        status: true
      },
      {
        name: 'SDE 3',
        date: '12th June, 2024',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien.',
        status: false
      },
      {
        name: 'Internship 2',
        date: '12th June, 2024',
        description: 'Aliquam in hendrerit urna. Pellentesque sit amet sapien.',
        status: true
      },
      {
        name: 'Fresher 2',
        date: '12th June, 2024',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien.',
        status: true
      }
    ];
  
    toggleStatus(index: number) {
      this.templates[index].status = !this.templates[index].status;
    }
}
