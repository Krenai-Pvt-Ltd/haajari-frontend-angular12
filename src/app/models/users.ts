import { Organization } from "./organization";

export class Users {
    id !: number;
    name !: string;
    slackUserId !: string;
    enterprise !: Enterprise;
    organization !: Organization;
    presenceStatus !: Boolean;
    status !: Status;
}

// export class Organization{
//     id !: number;
//     name !: string;
//     state !: string;
//     country !: string;
//     imageData !: ImageData;
// }

export class Enterprise{
    enterpriseId !: number;
    name !: string;
    createdDate !: Date;
    slackEnterpriseId !: string;
    apiAppId !: string;
}

export class Status{
    id !: number;
    name !: string;
    desc !: string;
}
export { Organization };

