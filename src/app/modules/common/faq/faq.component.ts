import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {

  constructor(    private router:Router) { }

  ngOnInit(): void {
  }

  route(){
    this.router.navigate(['/faq-detail'])
  }

}
