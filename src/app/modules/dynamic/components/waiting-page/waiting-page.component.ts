import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-waiting-page',
  templateUrl: './waiting-page.component.html',
  styleUrls: ['./waiting-page.component.css'],
})
export class WaitingPageComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 3000);
  }
}
