export class constant {

    static EMPTY_STRINGS = [null, undefined, '', 'N/A', 'n/a', ' ', 'null', 'undefined'];

    public static ALLOWED_BULK_UPLOAD_FORMATS = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];

    public static DOC_TYPE_EMPLOYEE_AGREEMENT='employee_agreement';
    public static DOC_TYPE_COMPANY='company_doc';
    public static DOC_TYPE_EMPLOYEE='employee_doc';
    public static DOC_TYPE_HR_POLICY='hr_policy';
    public static REMOVE_SHIFT_STRING = 'Keep In - ';
    public static USER = 'USER';
    public static DELETE = 'Delete';
    public static DISABLE = 'Disable';


    public static ORG_ONBOARDING_PERSONAL_INFORMATION_STEP_ID = "1";
    public static ORG_ONBOARDING_EMPLOYEE_CREATION_STEP_ID = "2";
    public static ORG_ONBOARDING_SHIFT_TIME_STEP_ID = "3";
    public static ORG_ONBOARDING_ATTENDANCE_MODE_STEP_ID = "4";
    public static ORG_ONBOARDING_ONBOARDING_COMPLETED_STEP_ID = "5";


    /**
     * ONBOARDING ROUTES START
     */
    public static ORG_ONBOARDING_PERSONAL_INFORMATION_ROUTE = "/auth/personal-information";
    public static ORG_ONBOARDING_EMPLOYEE_CREATION_ROUTE = "/auth/upload-team";
    public static ORG_ONBOARDING_SHIFT_TIME_ROUTE = "/auth/shift-time-list";
    public static ORG_ONBOARDING_SHIFT_TIME_PLACEHOLDER_ROUTE = "/auth/add-shift-placeholder";
    public static ORG_ONBOARDING_ATTENDANCE_MODE_ROUTE = "/auth/attendance-mode";
    public static ORG_ONBOARDING_ADD_SHIFT_TIME_ROUTE ="/auth/add-shift-time";
    public static DASHBOARD_ROUTE = "/dashboard";
    public static SETTING_SUBSCRIPTION_ROUTE = "/setting/subscription";
    public static LOGIN_ROUTE = "/auth/login";
    /**
     * ONBOARDING ROUTES END
     */

    public static PUBLIC_MARK_ATTENDANCE_URL = "/additional/location-validator";
    public static PUBLIC_APPLY_LEAVE_URL = "/additional/leave-request";
    public static FAQ_URL = "/additional/faq";
    public static PUBLIC_APPLY_ATENDANCE_UPDATE = "/additional/attendance-request"
    public static PUBLIC_MARK_ATTENDANCE_WITH_IMAGE_URL="/additional/attendance-photo";
    public static PUBLIC_SLACK_INSTALL_SUCCESS ="/additional/slack-installation-successfull";
    public static PUBLIC_SERVER_ERROR="/additional/internal-server-error";
    public static PUBLIC_ONBOARDING_FORM="/employee-onboarding/employee-onboarding-form"
    public static ONBOARDING_ROUTES = [constant.ORG_ONBOARDING_PERSONAL_INFORMATION_ROUTE, constant.ORG_ONBOARDING_EMPLOYEE_CREATION_ROUTE, constant.ORG_ONBOARDING_SHIFT_TIME_ROUTE,
    constant.ORG_ONBOARDING_ATTENDANCE_MODE_ROUTE
    ]

    public static PUBLIC_ROUTES = [constant.PUBLIC_MARK_ATTENDANCE_URL,constant.PUBLIC_APPLY_LEAVE_URL,constant.PUBLIC_MARK_ATTENDANCE_WITH_IMAGE_URL,constant.PUBLIC_SLACK_INSTALL_SUCCESS,
        constant.PUBLIC_SERVER_ERROR, constant.PUBLIC_ONBOARDING_FORM,constant.PUBLIC_APPLY_ATENDANCE_UPDATE, constant.FAQ_URL
    ];


    public static  jobTitles: string[] = [
        'Accountant',
        'Accounting Manager',
        'Administrative Assistant',
        'AI Developer (Artificial Intelligence)',
        'Angular Developer',
        'AR/VR Developer (Augmented Reality / Virtual Reality)',
        'Assembly Line Worker',
        'Automation Test Engineer',
        'Back-End Developer',
        'Bioinformatics Developer',
        'Blockchain Developer',
        'Brand Manager',
        'Business Analyst',
        'Business Development Executive',
        'Business Development Manager',
        'Buyer',
        'Call Center Agent',
        'Cash Manager',
        'Chief Financial Officer (CFO)',
        'Civil Engineer',
        'Cloud Developer (AWS Developer, Azure Developer, etc.)',
        'Communications Director',
        'Communications Specialist',
        'Compliance Analyst',
        'Compliance Officer',
        'Content Writer',
        'Corporate Lawyer',
        'Corporate Social Responsibility Manager',
        'Corporate Trainer',
        'Creative Director',
        'Customer Service Manager',
        'Customer Service Representative',
        'Database Administrator',
        'Database Developer',
        'Data Warehouse Developer',
        'Desktop Application Developer',
        'DevOps Developer',
        'Digital Marketing Specialist',
        'Distribution Manager',
        'Electrical Engineer',
        'Embedded Systems Developer',
        'EHS Manager',
        'Engineering Manager',
        'Environmental Analyst',
        'Environmental Engineer',
        'Event Coordinator',
        'Executive Assistant',
        'Facilities Manager',
        'Finance Manager',
        'Financial Analyst',
        'Front-End Developer',
        'Full Stack Developer',
        'Game Developer',
        'General Counsel',
        'Go Developer',
        'Graphic Designer',
        'Green Program Manager',
        'Health and Safety Officer',
        'Help Desk Technician',
        'Helpdesk Technician',
        'HR Generalist',
        'HR Manager',
        'HTML/CSS Developer',
        'Human Resources',
        'Information Technology (IT)',
        'Investment Analyst',
        'Inventory Manager',
        'Inventory Specialist',
        'IT Manager',
        'Java Developer',
        'JavaScript Developer',
        'Junior Software Developer',
        'Lead Developer / Technical Lead',
        'Learning and Development Specialist',
        'Legal Assistant',
        'Logistics Coordinator',
        'Logistics Manager',
        'Machine Learning Developer',
        'Maintenance Manager',
        'Maintenance Technician',
        'Manufacturing Engineer',
        'Market Research Analyst',
        'Marketing Manager',
        'Mechanical Engineer',
        'Media Relations Coordinator',
        'Mobile App Developer (Android Developer, iOS Developer)',
        'Network Engineer',
        'Node.js Developer',
        'Office Manager',
        'Operations Analyst',
        'Operations Manager',
        'Paralegal',
        'Payroll Clerk',
        'Payroll Specialist',
        'PHP Developer',
        'Plant Manager',
        'Plumber',
        'Product Designer',
        'Product Developer',
        'Product Manager',
        'Production Manager',
        'Production Planner',
        'Program Manager',
        'Project Coordinator',
        'Project Manager',
        'Public Relations Officer',
        'Procurement Manager',
        'Process Improvement Specialist',
        'Product Development',
        'Product Owner (in a software development context)',
        'Project Management',
        'Public Relations',
        'Purchasing Agent',
        'Python Developer',
        'QA Developer',
        'Quality Assurance Manager',
        'Quality Control Inspector',
        'Quality Control Technician',
        'Quality Inspector',
        'React Developer',
        'Receptionist',
        'Recruiter',
        'Regulatory Affairs Manager',
        'Research and Development (R&D)',
        'Research and Development Engineer',
        'Research Scientist',
        'Risk Analyst',
        'Risk Manager',
        'Robotics Developer',
        'Ruby Developer',
        'R&D Engineer',
        'R&D Manager',
        'Sales Manager',
        'Sales Representative',
        'Scrum Master',
        'Scala Developer',
        'Security Developer',
        'Senior Software Developer',
        'SEO Specialist',
        'Software Architect',
        'Software Development Manager',
        'Software Engineer',
        'Software Test Developer',
        'Software Tester',
        'Software Development',
        'Software Test Developer',
        'Software Tester',
        'Sourcing Manager',
        'Supply Chain Analyst',
        'Supply Chain Manager',
        'Sustainability Coordinator',
        'Sustainability Manager',
        'Systems Administrator',
        'Systems Software Developer',
        'Tax Specialist',
        'Training and Development Officer',
        'Training Manager',
        'Transportation Coordinator',
        'Treasury Analyst',
        'Treasurer',
        'UI (User Interface) Developer',
        'UX (User Experience) Developer',
        'Vue.js Developer',
        'Web Designer',
        'Web Developer',
        'Workplace Safety Officer',
      ];


      /**
       * CHART COLORS
       */
      public static COLORS: string[] = ['#8989F5','#B8B8F9','#E7E7FD'];
}

