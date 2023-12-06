import { Organization } from "./organization";

export class Users {
    id !: number;
    name !: string;
    uuid !: string;
    email !: string;
    slackUserId !: string;
    userImage!:String;
    enterprise !: Enterprise;
    organization !: Organization;
    presenceStatus !: Boolean;
    status !: Status;
    onboardingStatusUpdateDate!: Date
    employeeOnboardingStatus!: Status
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
    response !: string;
}
export { Organization };

