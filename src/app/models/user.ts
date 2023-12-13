export class User {

    id!: number;
    name!: string;
    uuid!: string;
    email!: string;
    phoneNumber!: string;
    image!: string;
    slackUserId!: string;
    presenceStatus!: string
    onboardingStatusUpdateDate!: Date
    employeeOnboardingStatus!: Status
    selected!: any;
}

export class Status{
    id !: number;
    name !: string;
    desc !: string;
}
