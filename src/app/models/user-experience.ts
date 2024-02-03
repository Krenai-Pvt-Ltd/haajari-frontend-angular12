export class UserExperience {
    companyName: string = '';
    // employementDuration: string = '';
    jobResponisibilities: string = '';
    lastSalary: string = '';
    lastJobDepartment: string = ''; 
    lastJobPosition: string = ''; 
    fresher: boolean = false; 
    statusId: number = 0;
    directSave: boolean = false;
    employeeOnboardingFormStatus: string = '';
    employeeOnboardingStatus: string = '';
    startDate?: Date | null; // Can be Date, null, or undefined
    endDate?: Date | null;
    dateRange?: [Date | undefined, Date | undefined];
}