export class Routes {
    /**
    * LOGIN ROUTES START
    */
    public static LOGIN = "/auth/login";
    public static SIGNUP = "/auth/signup";
    public static SLACK_AUTH = "/auth/slackauth";
    public static SLACK_SIGN_IN = "/auth/sign-in-with-slack";
    public static ONBOARDING_WHATSAPP ="/auth/onboarding-whatapp"

    /**
    * LOGIN ROUTES END
    */

    static AUTH_ROUTES = ['/auth/login', '/auth/signup', '/auth/otp-verification', '/auth/slackauth', '/auth/sign-in-with-slack', '/auth/addtoslack',
        '/auth/new-login', '/auth/onboarding-whatsApp-slack', '/auth/onboarding-whatapp', '/auth/organization-registration-form',
        '/auth/personal-information', '/auth/leave-rule-setup', '/auth/holiday-rule-setup',
        '/auth/automation-rules', '/auth/leave-setting-create', '/auth/add-shift-time',
        '/auth/holiday-setting', '/auth/upload-team', '/auth/attendance-mode',
        '/auth/shift-time-list', '/auth/add-shift-placeholder'];

 /**
    * DYNAMIC ROUTES START
    */
    public static DASHBOARD = "/dashboard";
    public static EMPLOYEEONBOARDING = "/employee-onboarding-data";
    public static TIMETABLE = "/timetable"
    public static TEAM = "/team"
    public static TEAMDETAIL = "/team-detail"
    public static LEAVEMANAGEMENT = "/leave-management"
    public static LEAVEMANAGEMENTS = "/leave-managements"
    public static EXPENSE = "/expense"
    public static ASSETS = "/assets"
    public static REPORTS = "/reports"
    public static COINS = "/coins"
    public static PAYROLLDASHBOARD = "/payment/payroll-dashboard"
    public static BONUSDEDUCTION = "/payment/bonus-and-deduction"
    public static EPFESITDS = "/payment/epf-esi-tds"
    public static PAYMENTHISTORY = "/payment/payment-history"
    public static COMPANYSETTING = "/setting/company-setting"
    public static ATTENDANCESETTING = "/setting/attendance-setting"
    public static LEAVESETTING = "/setting/leave-setting"
    public static SALARYSETTING = "/setting/salary-setting"
    public static ROLE = "/role"
    public static ADDROLE = "/add-role"
    public static EXITPOLICY = "/exit-policy"
    public static SUBSCRIPTION = "/setting/subscription"
    public static ACCOUNTSETTINGS = "/setting/account-settings"
    public static INBOX = "/inbox"
    public static ASSETSMANAGEMENT = "/assets-management"
    public static FAQ = "/faq"
    public static FAQDETAIL = "/faq-detail"
    public static EXPENSEMANAGEMENT = "/expense-management"
    public static PAYROLL = "/payroll/setup"
    public static CONFIGURATION = "/payroll/configuration"
    public static EARNINGDETAILS = "/payroll/earning-details"
    public static SALARYTEMPLATE = "/payroll/salary-template"
    public static EMPLOYEE_PROFILE = "/employee";
    public static LEAVEPOLICY = "/setting/leave-policy";
    
 /**
    * DYNAMIC ROUTES END
    */




    static LOGIN_ROUTES = [Routes.LOGIN,Routes.SIGNUP,Routes.SLACK_AUTH,Routes.SLACK_SIGN_IN ,Routes.ONBOARDING_WHATSAPP]

    // routes for slack auth to exclude from onboarding service check and if needed then call explicitly onboarding service
    static SLACK_AUTH_ROUTES = [Routes.SLACK_AUTH,Routes.SLACK_SIGN_IN];
}