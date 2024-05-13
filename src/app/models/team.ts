export class UserResponse {
  id!: number;
  name!: string;
  email!: string;
  image!: string;
  uuid!: string;
}

export class TeamLocationResponse {
  addressLine1!: string;
  addressLine2!: string;
  city!: string;
  state!: string;
  country!: string;
  pincode!: string;
  latitude!: string;
  longitude!: string;
  range!: string;
}

export class TeamResponse {
  id!: number;
  name!: string;
  description!: string;
  uuid!: string;
  manager!: UserResponse;
  //   teamLocation!: TeamLocationResponse;
  userList!: UserResponse[];
  showTick: boolean = false;
  exitFromTeam: boolean = false;
}
