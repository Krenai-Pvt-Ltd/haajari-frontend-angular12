import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-faq-detail',
  templateUrl: './faq-detail.component.html',
  styleUrls: ['./faq-detail.component.css']
})
export class FaqDetailComponent implements OnInit {

  constructor(
    private router:Router
  ) { }

  faq: any;

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    this.faq = nav?.extras?.state?.['faq'];

    // if (!this.faq) {
    //   // fallback if accessed directly
    //   this.router.navigate(['/faq']);
    // }
  }

  route(){
    this.router.navigate(['/faq'])
  }

}
