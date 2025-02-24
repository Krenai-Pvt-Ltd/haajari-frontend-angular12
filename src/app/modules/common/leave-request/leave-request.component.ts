import { Component, OnInit } from '@angular/core';
import { LeaveResponse } from 'src/app/models/leave-responses.model';

@Component({
  selector: 'app-leave-request',
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.css']
})
export class LeaveRequestComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  logInUserUuid: string = '';

  leave!: LeaveResponse;
        viewLeave(leave:any){
          this.leave = leave;

        }

        imageError: boolean = false;


        handleImageError() {
          this.imageError = true;
        }

        openInNewTab(url: string) {
          window.open(url, '_blank');
        }

}
