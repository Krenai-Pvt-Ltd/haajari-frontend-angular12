export class AttendanceDetailsResponse {
  userDetailsResponse!: UserDetailsResponse;
  createdDate!: Date;
  createdDay!: string;
  checkInTime!: Date;
  checkOutTime!: Date;
  duration!: string;
  totalPresentDays!: number;
  breakCount!: number;
  breakDuration!: string;

 

}

export class UserDetailsResponse {
  userUuid!: string;
  userName!: string;
  userEmail!: string;
  userImage!: string;
}

