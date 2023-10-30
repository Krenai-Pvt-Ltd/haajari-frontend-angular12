export class UserResponse {
    id!: number;
    name!: string;
    email!: string;
    image!: string

}
export class TeamResponse {
    id!: number;
    name!: string;
    description!: string;
    manager!: UserResponse;
    userList!: UserResponse[];
}