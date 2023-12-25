import { ManagerResponse } from "./manager-response";

export class TeamWithoutUsersResponse {

    id : number = 0;
    name : string = '';
    description : string = '';
    uuid : string = '';
    manager : ManagerResponse = new ManagerResponse();

}
