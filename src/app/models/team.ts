export class UserResponse {
    id!: number;
    name!: string;
    email!: string;
    image!: string;
    uuid!: string;

}
export class TeamResponse {
    id!: number;
    name!: string;
    description!: string;
    uuid!: string;
    manager!: UserResponse;
    userList!: UserResponse[];
    showTick:boolean=false;
    exitFromTeam: boolean=false;
}