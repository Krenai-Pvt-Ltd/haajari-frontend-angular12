export class constant{

    static EMPTY_STRINGS = [null, undefined, '', 'N/A', 'n/a', ' ', 'null', 'undefined'];

    public static ALLOWED_BULK_UPLOAD_FORMATS=['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel'];

    public static REMOVE_SHIFT_STRING = 'Keep In - ';

    public static ORG_ONBOARDING_PERSONAL_INFORMATION_STEP_ID = "1";
    public static ORG_ONBOARDING_EMPLOYEE_CREATION_STEP_ID = "2";
    public static ORG_ONBOARDING_SHIFT_TIME_STEP_ID = "3";
    public static ORG_ONBOARDING_ATTENDANCE_MODE_STEP_ID = "4";
    public static ORG_ONBOARDING_ONBOARDING_COMPLETED_STEP_ID = "5";



    public static ORG_ONBOARDING_PERSONAL_INFORMATION_ROUTE = "/organization-onboarding/personal-information";
    public static ORG_ONBOARDING_EMPLOYEE_CREATION_ROUTE = "/organization-onboarding/upload-team";
    public static ORG_ONBOARDING_SHIFT_TIME_ROUTE = "/organization-onboarding/shift-time-list";
    public static ORG_ONBOARDING_ATTENDANCE_MODE_ROUTE = "/organization-onboarding/attendance-mode";
    public static DASHBOARD_ROUTE = "/dashboard";
    public static SETTING_SUBSCRIPTION_ROUTE = "/setting/subscription";
    public static LOGIN_ROUTE = "/auth/login";

    public static ONBOARDING_ROUTES =[constant.ORG_ONBOARDING_PERSONAL_INFORMATION_ROUTE, constant.ORG_ONBOARDING_EMPLOYEE_CREATION_ROUTE, constant.ORG_ONBOARDING_SHIFT_TIME_ROUTE,
    constant.ORG_ONBOARDING_ATTENDANCE_MODE_ROUTE
    ]
}

