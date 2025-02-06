import { EmployeeOnboardingFormStatus } from "./employee-onboarding-form-status";
import { EmployeeOnboardingStatus } from "./employee-onboarding-status";

export class UserPersonalInformationRequest {
        name!: string;
        email!: string;
        uuid!: string;
        fatherName!: string;
        phoneNumber!: string;
        dateOfBirth!: Date;
        gender!: string;
        joiningDate!: Date;
        currentSalary!: string;
        department!: string;
        position!: string;
        nationality!: string;
        maritalStatus!: string;
        statusResponse!: string;
        image!: string;
        employeeOnboardingStatus!: EmployeeOnboardingStatus;
        employeeOnboardingFormStatus!: EmployeeOnboardingFormStatus;
        statusId!: number;
        directSave!: boolean;
        subscriptionPlan!: boolean;
	subscriptionPlanId!: number;
        notificationVia!: number;
        languagePreferred!: number;
        slackUserId!: string;
        employeeAttendanceFlag!: boolean;
        employeeAttendanceForManagerType!: number;
        updateRequest!: boolean;
        isProbation!: boolean;
        uan!: string;
        esi!: string;
}
