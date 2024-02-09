import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-otp-verification',
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.css']
})
export class OtpVerificationComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  otp: string = '';

  onOtpInputChange(index: number) {
    console.log(`Input ${index} changed`);
  }

  verifyOtp() {
    // Implement your OTP verification logic here
    console.log('Verifying OTP:', this.otp);
  }
}

