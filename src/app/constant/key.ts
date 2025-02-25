import { BASE_URL } from 'src/environments/environment';
export class Key {

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  base_url = BASE_URL;
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  public static LOGGED_IN_USER = new Object();

  public static PRIVILEGE_VIEW = 1;
  public static PRIVILEGE_MANAGE = 2;
  public static PRIVILEGE_ACCESS = 3;

  public static DYNAMIC = '/dynamic';
  public static LOGIN = `${Key.DYNAMIC}/login`;
  public static ONBOARDING = `${Key.DYNAMIC}/onboarding`;
  public static DASHBOARD = `/dashboard`;
  public static HEADER = `${Key.DYNAMIC}/header`;
  public static TOPBAR = `${Key.DYNAMIC}/topbar`;
  public static TIMETABLE = `${Key.DYNAMIC}/timetable`;
  public static PROJECT = `${Key.DYNAMIC}/project`;
  public static TEAM = `${Key.DYNAMIC}/team`;
  public static TASKMANAGER = `${Key.DYNAMIC}/task-manager`;
  public static LIVEMANAGER = `${Key.DYNAMIC}/live-manager`;
  public static PAYMENT = `${Key.DYNAMIC}/payment`;
  public static USERLIST = `${Key.DYNAMIC}/userlist`;
  public static SLACKAUTH = `${Key.DYNAMIC}/slackauth`;
  public static ADDTOSLACK = `${Key.DYNAMIC}/addtoslack`;
  public static WATING = `${Key.DYNAMIC}/waiting`;
  public static TEAMDETAIL = `${Key.DYNAMIC}/team-detail`;
  public static LEAVEMANAGEMENT = `${Key.DYNAMIC}/leave-management`;

  public static HEADER_ROUTES = [
    '/dashboard',
    '/header',
    '/topbar',
    '/timetable',
    '/project',
    '/team',
    '/task-manager',
    '/payment',
    '/assets',
    '/coins',
    '/userlist',
    '/addtoslack',
    '/waiting',
    '/team-detail',
    '/user-profile',
    '/employee-onboarding-data',
    '/setting/attendance-setting',
    '/setting/company-setting',
    '/setting/salary-setting',
    '/role',
    '/employee-onboarding-sidebar',
    '/reports',
    '/employee-profile',
    '/add-role',
    '/setting/billing',
    '/setting/leave-setting',
    '/setting/account-settings',
    '/add-role',
    '/setting/billing-payment',
    '/leave-management',
    '/upload-team',
    '/central-leave-management',
    '/payment/payroll-dashboard',
    '/payment/epf-esi-tds',
    '/payment/bonus-and-deduction',
    '/payment/payment-history',
    '/payment/payroll-dashboard/leave-summary',
    '/to-do-step-dashboard',
    '/setting/subscription',
    '/setting/onboarding-setting',
    '/refer-friend',
    '/expense',
    '/exit-policy',
    '/leave-managements',
    '/inbox',
    '/assets-management',
    '/faq',
    '/faq-detail',
    '/expense-management',
    '/payroll/setup'
  ];

  public static TOPBAR_ROUTES = [
    '/dashboard',
    '/header',
    '/topbar',
    '/timetable',
    '/project',
    '/team',
    '/task-manager',
    '/payment',
    '/userlist',
    '/addtoslack',
    '/waiting',
    '/team-detail',
    '/user-profile',
    '/employee-onboarding-data',
    '/setting/attendance-setting',
    '/setting/company-setting',
    '/setting/salary-setting',
    '/role',
    '/employee-onboarding-sidebar',
    '/reports',
    '/assets',
    '/coins',
    '/employee-profile',
    '/add-role',
    '/setting/billing',
    '/setting/leave-setting',
    '/setting/account-settings',
    '/add-role',
    '/setting/billing-payment',
    '/leave-management',
    '/upload-team',
    '/central-leave-management',
    '/payment/payroll-dashboard',
    '/payment/epf-esi-tds',
    '/payment/bonus-and-deduction',
    '/payment/payment-history',
    '/payment/payroll-dashboard/leave-summary',
    '/setting/subscription',
    '/setting/onboarding-setting',
    '/refer-friend',
    '/expense',
    '/exit-policy',
    '/leave-managements',
    '/inbox',
    '/assets-management',
    '/faq',
    '/faq-detail',
    '/expense-management',
    '/payroll/setup'
  ];

  public static ORGANIZATION_ONBOARDING_SIDEBAR_ROUTES = [
    '/auth/personal-information',
    '/auth/attendance-rule-setup',
    '/auth/leave-rule-setup',
    '/auth/holiday-rule-setup',
    '/auth/automation-rules',
    '/auth/creat-rule',
    '/auth/leave-setting-create',
    '/auth/add-shift-time',
    '/auth/holiday-setting',
    '/auth/upload-team',
    '/auth/shift-time-list',
    '/auth/attendance-mode',
    '/auth/add-shift-placeholder',
  ];

  // Deduction Ids
  public static DEDUCTION_TYPE_PER_MINUTE = 1;
  public static DEDUCTION_TYPE_FIXED_AMOUNT = 2;

  // Overtime Ids
  public static OVERTIME_TYPE_FIXED_AMOUNT = 1;

  // Attendance Defintion rules Ids
  public static LATE_ENTRY_RULE = 1;
  public static BREAK_RULE = 2;
  public static EARLY_EXIT_RULE = 3;
  public static OVERTIME_RULE = 4;

  // Salary calculation mode Ids
  public static UNRESTRICTED_PF_WAGE = 1;
  public static RESTRICTED_PF_WAGE_UPTO_15000 = 2;

  // Statutory calculation mode Ids
  public static EPF_ID = 1;
  public static ESI_ID = 2;
  public static PROFESSIONAL_TAX_ID = 3;

  public static PASTE = 'paste';
  public static COPY = 'copy';
  public static CUT = 'cut';
  public static DELETE = 'delete';
  public static EDIT = 'edit';
  public static BACKSPACE = 'Backspace';
  public static ENTER = 'Enter';

  public static VIEW_ALL = 'View All';
  public static VIEW_LESS = 'View Less';

  // Toast statusResponse
  public static TOAST_STATUS_SUCCESS = 'Success';
  public static TOAST_STATUS_ERROR = 'Error';
  public static TOAST_STATUS_WARNING = 'Warning';
  public static TOAST_STATUS_INFO = 'Info';
  // Current status of employee
  public static WORKING = 'Working';
  public static ON_BREAK = 'On Break';
  public static CHECKED_OUT = 'Checked Out';

  // Role
  public static ADMIN = 'ADMIN';
  public static USER = 'USER';
  public static MANAGER = 'MANAGER';
  public static HRADMIN = 'HR ADMIN';

  // Day wise status
  public static PRESENT = 'Present';
  public static ABSENT = 'Absent';
  public static UNMARKED = 'Unmarked';
  public static WEEKEND = 'Weekend';
  public static HOLIDAY = 'Holiday';
  public static LEAVE = 'Leave';
  public static HALFDAY = 'Halfday';

  // Salary setting configuration
  public static CONFIGURE_SALARY_SETTING = 1;
  public static MANAGE_STATUTORY = 2;
  public static PAY_SLIP = 3;

  // Salary component id
  public static BASIC_PAY_ID = 1;
  public static HRA_ID = 2;
  public static CONVEYANCE_ID = 3;
  public static MEDICAL_ALLOWANCE = 4;
  public static SPECIAL_ALLOWANCE = 5;
  public static ADDITIONAL_ALLOWANCE = 6;

  // Organization onboarding steps
  public static PERSONAL_INFORMATION_STEP = 1;
  public static EMPLOYEE_CREATION_STEP = 2;
  public static SHIFT_TIME_STEP = 3;
  public static ATTENDANCE_MODE_STEP = 4;
  public static REGISTRATION_COMPLETED_STEP = 5;

  // Data format
  public static BOARD = 1;
  public static LIST = 2;

  // Shift Time steps
  public static SHIFT_TIME = 1;
  public static WEEK_OFF = 2;
  public static STAFF_SELECTION = 3;
  


  // Attendance mode id
  public static MANUAL_ATTENDANCE = 1;

  // Krenai UUID
  public static KRENAI_UUID = '60811bf3-ae1e-11ee-9597-784f4361d885';
  public static DEMO_ORGANIZATION_UUID = '8d3cc5c2-21a7-11ef-98b2-0a3b903b1973';

  //subscription plan
  get_invoices = '/invoices';
  download_invoice = '/invoices/download';
  get_active_user_count = '/users/active-user-count';
  get_restricted_modules = '/module/restriction'

  //NEW SUBSCRIPTION PLAN API KEY
  get_subscription_plans = '/subscription/plan';
  get_current_subscription_plan='/subscription/current';
  get_subscription_plan_light_detail='/subscription/plan/detail';
  verify_gst_number='/subscription/gst';
  get_subscription_payment_detail='/subscription/payment';
  is_plan_expired = '/subscription/is-expired';

  //user notification
  get_notification = '/user-notification';
  read_notification = '/user-notification/read';
  read_all_notification = '/user-notification/read-all';
  get_mail = '/user-notification/mail';

  //Coupon
  verify_coupon = '/coupon/verify';

  check_user_email_existence = '/users/check-email-existence';
  check_user_phone_existence = '/users/check-phone-existence';

  //user import
  create_user = '/whatsapp-user-onboarding/create';

  get_onboarding_user = '/whatsapp-user-onboarding/onboarding-user';
  get_onboarding_user_for_emp_onboarding_data =
    '/whatsapp-user-onboarding/onboarding-user-for-employee-onboarding-data';
  delete_onboarding_user = '/whatsapp-user-onboarding/delete';
  edit_onboarding_user = '/whatsapp-user-onboarding/update';

  user_import = '/whatsapp-user-onboarding/import';
  user_import_onboarding = '/whatsapp-user-onboarding/import/onboarding';

  get_report = '/user-import';

  // base_url = "http://localhost:8080/api/v2";

  /* ------------------  Staging urls ----------------*/
  // base_url = "https://staging.hajiri.work/api/v2";

  check_number_existence = '/whatsapp-user-onboarding/check-number-existence';
  check_email_existence = '/whatsapp-user-onboarding/check-email-existence';

  check_number_existence_without_token = '/users/check-number-existence';
  check_email_existence_without_token = '/users/check-email-existence';

  save_organization_onboarding_step = '/organization/save-onboarding-step';
  get_organization_onboarding_step = '/organization/onboarding-step';

  // Organization Onboarding Steps:

  //Employee Change Step
  public static NEW_JOINEE_STEP = 1;
  public static USER_EXIT_STEP = 2;
  public static FINAL_SETTLEMENT_STEP = 3;

  //User type in Employee change
  public static NEW_JOINEE = 1;
  public static USER_EXIT = 2;
  public static FINAL_SETTLEMENT = 3;

  //Attendance, Leave & Present Days
  public static LEAVES = 4;
  public static LOP_SUMMARY = 5;
  public static LOP_REVERSAL = 6;

  //Salary change, bonus and deduction
  public static SALARY_CHANGE = 7;
  public static BONUS = 8;
  public static OVERTIME = 9;

  //EPF, ESI & TDS
  public static EPF = 10;
  public static ESI = 11;
  public static TDS = 12;

  //Payroll steps
  public static PAYROLL_STEP_COMPLETED = 13;
  public static PAYROLL_PORCESSED = 14;

  // Payroll History
  public static PAYROLL_HISTORY = 13;

  //Attendance rule type ids
  public static DEDUCTION_RULE_DEFINITION = 1;
  public static OVERTIME_RULE_DEFINITION = 2;

  //Steps declared for fix amount validation in overtime
  public static CUSTOM_OVERTIME_FIX_AMOUNT_STEP = 1;
  public static HALF_DAY_OVERTIME_FIX_AMOUNT_STEP = 2;
  public static FULL_DAY_OVERTIME_FIX_AMOUNT_STEP = 3;

  //Overtime pay types
  public static FIX_AMOUNT_STEP = 1;

  //Date initial and last hours
  public static INITIAL_HOUR = '00:00:00';
  public static END_HOUR = '23:59:59';

  // Status
  public static PENDING = 13;
  public static APPROVED = 14;
  public static REJECTED = 15;

  //Salary template tab
  public static SALARY_TEMPLATE_STEP = 'SALARY_TEMPLATE_STEP';
  public static STAFF_SELECTION_STEP = 'STAFF_SELECTION_STEP';

  //Overtime configuration hour type
  public static PRE_HOUR = 1;
  public static POST_HOUR = 2;

  // RazorPay Key

  public static razorKey = 'rzp_test_Wd1RYd0fng3673'; // Test
  // public static razorKey = 'rzp_live_twiokSC5krYrnQ'; // Live
  //
  public static ENABLE = 1;
  public static DISABLE = 2;

  // Logs tab in attendance section
  public static LEAVE_LOG = 1;
  public static OVERTIME_LOG = 2;
  public static LOP_REVERSAL_LOG = 3;
  public static ATTENDANCE_UPDATE_REQUEST_LOG = 4;

  // public static SLACK_WORKSPACE_URL = `https://slack.com/app_redirect?app=A07AT94EHK7&tab=home`;
  // static GEOLOCATION = 'geolocation'
  // Tabs in Attendance Section
  public static ATTENDANCE_TAB = 1;
  public static OVERTIME_TAB = 2;
  public static ATTENDANCE_UPDATE_REQUEST_TAB = 3;
  public static ATTENDANCE_UPDATE_REQUEST_TAB_NEW = 4;

  // Tabs in Overtime Section
  public static OVERTIME_PENDING_REQUEST_TAB = 1;
  public static OVERTIME_HISTORY_TAB = 2;

  // Tabs in Updation request section
  public static ATTENDANCE_UPDATE_PENDING_REQUEST_TAB = 1;
  public static ATTENDANCE_UPDATE_REQUEST_HISTORY_TAB = 2;

  // Gender
  public static ALL = 1;
  public static MALE = 2;
  public static FEMALE = 3;
  public static OTHERS = 4;

  // Unused leave action
  public static LAPSE = 1;
  public static CARRY_FORWARD = 2;
  public static ENCASH = 3;

  // Leave Cycle
  public static MONTHLY = 1;
  public static QUARTERLY = 2;
  public static HALF_YEARLY = 3;
  public static YEARLY = 4;

  // Leave renewal cycle
  public static ANNUAL_YEAR = 'Annual Year (Jan - Dec)';
  public static FINANCIAL_YEAR = 'Financial Year (Apr - Mar)';

  // Sandwitch rule
  public static YES = 'Yes';
  public static NO = 'No';

  //  Attendance Main Modes
  public static MODE1 = 'Slack_and_Whatsapp';
  public static MODE2 = 'Machine';
  public static MODE3 = 'Lens';

  // OnboardingProcessStep
  public static COMPANY_SETTING_ID = 1;
  public static ATTENDANCE_MODE_ID = 2;
  public static SHIFT_TIME_ID = 3;
  public static AUTOMATION_RULE_ID = 4;
  public static LEAVE_TEMPLATE_ID = 5;
  public static SALARY_TEMPLATE_ID = 6;

  public static PROCESS_COMPLETED = 36;
  public static PROCESS_PENDING = 35;

  // redirect to slack

  public static SLACK_WORKSPACE_URL = `https://slack.com/app_redirect?app=A05QD5T9EK1&tab=home`;   //prod
  // public static SLACK_WORKSPACE_URL = `https://slack.com/app_redirect?app=A07AT94EHK7&tab=home`;

  static GEOLOCATION = 'geolocation';

  // Automation rule definition component count to apply CSS dynamically
  public static COL_MD_4 = 3;
  public static COL_MD_6 = 2;
  public static COL_MD_12 = 1;

  // employee profile old and new routes
  // public static EMPLOYEE_PROFILE_ROUTE = '/employee-profile';
  public static EMPLOYEE_PROFILE_ROUTE = '/employee';
  public static ATTENDANCE_SETTING_ROUTE = '/setting/attendance-setting';
  public static LEAVE_SETTING_ROUTE = '/setting/leave-setting';


  public static ABSENT_TAB = "ABSENT";
	public static ON_LEAVE_TAB = "ON_LEAVE";
	public static DEFAULTER_TAB = "DEFAULTER";
	public static CONSISTENT_TAB = "CONSISTENT";
	public static LEAVE_BY_DEPARTMENT_TAB = "LEAVE_BY_DEPARTMENT";

  public static LEAVE_QUOTA_EXCEEDED="The requested leave exceeds your available quota.";
}


