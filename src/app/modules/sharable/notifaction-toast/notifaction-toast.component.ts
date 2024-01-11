import { Component, OnInit } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-notifaction-tost',
  templateUrl: './notifaction-toast.component.html',
  styleUrls: ['./notifaction-toast.component.css']
})
export class NotifactionTostComponent implements OnInit {

  constructor(private helperService : HelperService) { }

  ngOnInit(): void {
  }

  toastMessage = this.helperService.toastMessage;
  toastColorStatus = this.helperService.toastColorStatus;

  TOAST_STATUS_SUCCESS = 'Success';
  TOAST_STATUS_ERROR = 'Error';

}
