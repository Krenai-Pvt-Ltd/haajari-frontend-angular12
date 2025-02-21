export class EmployeeProfileResponse {
    profilePic !: string;
    userName !: string
    phoneNumber !: string
    email !: string;
    dateOfBirth !: string;
    currentRole !: string;
    teams !: string[];
    isProbation!: boolean;
    status: number = 0;
    resignationStatus: any
    agreementAccepted: boolean = false;
}
