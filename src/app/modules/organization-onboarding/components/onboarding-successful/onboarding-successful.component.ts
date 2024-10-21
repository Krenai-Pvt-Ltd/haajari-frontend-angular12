import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-onboarding-successful',
  templateUrl: './onboarding-successful.component.html',
  styleUrls: ['./onboarding-successful.component.css']
})
export class OnboardingSuccessfulComponent implements OnInit {

  constructor(private ngZone: NgZone,
    private ref: ChangeDetectorRef, private router: Router) { }
 
  ngOnInit(): void {

    // setTimeout(() => {
    //   // this.router.navigate(['/dashboard']);
    //   this.router.navigate(['/to-do-step-dashboard']);
    // }, 5000);
  }

  //  options: AnimationOptions = {
  //   path: '/assets/animation.json',
  // };

  // onLoopCompleteCalledTimes = 0;
  // onLoopComplete(): void {
  //   this.ngZone.run(() => {
  //     this.onLoopCompleteCalledTimes++;
  //     this.ref.detectChanges();
  //   });
  // }
}
