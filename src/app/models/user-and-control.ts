import { Role } from './role';
import { User } from './user';

export class UserAndControl {
  id!: number;
  updatedDate!: string;
  presenceStatus!: Boolean;
  user!: User;
  role!: Role;
  description!: string;
  //   phoneNumber!: string;
}
