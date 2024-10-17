import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
// import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-onboarding-successful',
  templateUrl: './onboarding-successful.component.html',
  styleUrls: ['./onboarding-successful.component.css']
})
export class OnboardingSuccessfulComponent implements OnInit {

  constructor(private ngZone: NgZone,
    private ref: ChangeDetectorRef,) { }
 
  ngOnInit(): void {
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
