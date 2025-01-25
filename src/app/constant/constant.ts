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
    public static PUBLIC_MARK_ATTENDANCE_WITH_IMAGE_URL="/additional/attendance-photo";
    public static PUBLIC_SLACK_INSTALL_SUCCESS ="/additional/slack-installation-successfull";
    public static PUBLIC_SERVER_ERROR="/additional/internal-server-error";
    public static PUBLIC_ONBOARDING_FORM="/employee-onboarding/employee-onboarding-form"
    public static ONBOARDING_ROUTES = [constant.ORG_ONBOARDING_PERSONAL_INFORMATION_ROUTE, constant.ORG_ONBOARDING_EMPLOYEE_CREATION_ROUTE, constant.ORG_ONBOARDING_SHIFT_TIME_ROUTE,
    constant.ORG_ONBOARDING_ATTENDANCE_MODE_ROUTE
    ]

    public static PUBLIC_ROUTES = [constant.PUBLIC_MARK_ATTENDANCE_URL,constant.PUBLIC_APPLY_LEAVE_URL,constant.PUBLIC_MARK_ATTENDANCE_WITH_IMAGE_URL,constant.PUBLIC_SLACK_INSTALL_SUCCESS,
        constant.PUBLIC_SERVER_ERROR, constant.PUBLIC_ONBOARDING_FORM
    ];



}

