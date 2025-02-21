import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-subscription-restricted',
  templateUrl: './subscription-restricted.component.html',
  styleUrls: ['./subscription-restricted.component.css']
})
export class SubscriptionRestrictedComponent implements OnInit {

  constructor(private modalService:NgbModal) { }

  ngOnInit(): void {
  }

  closeModal(){
    this.modalService.dismissAll();
  }
}
