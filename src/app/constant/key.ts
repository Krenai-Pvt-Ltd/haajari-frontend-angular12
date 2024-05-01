export class Key {
  public static LOGGED_IN_USER = new Object();

  public static PRIVILEGE_VIEW = 1;
  public static PRIVILEGE_MANAGE = 2;
  public static PRIVILEGE_ACCESS = 3;

  public static DYNAMIC = '/dynamic';
  public static LOGIN = `${Key.DYNAMIC}/login`;
  public static ONBOARDING = `${Key.DYNAMIC}/onboarding`;
  public static DASHBOARD = `${Key.DYNAMIC}/dashboard`;
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
    '/payment/tds',
    '/payment/bonus-and-deduction',
    '/payment/payment-history',
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
    '/payment/tds',
    '/payment/bonus-and-deduction',
    '/payment/payment-history',
  ];

  public static ORGANIZATION_ONBOARDING_SIDEBAR_ROUTES = [
    '/organization-onboarding/personal-information',
    '/organization-onboarding/attendance-rule-setup',
    '/organization-onboarding/leave-rule-setup',
    '/organization-onboarding/holiday-rule-setup',
    '/organization-onboarding/automation-rules',
    '/organization-onboarding/creat-rule',
    '/organization-onboarding/leave-setting-create',
    '/organization-onboarding/add-shift-time',
    '/organization-onboarding/holiday-setting',
    '/organization-onboarding/upload-team',
    '/organization-onboarding/shift-time-list',
    '/organization-onboarding/attendance-mode',
  ];

  // Deduction Ids
  public static DEDUCTION_TYPE_PER_MINUTE = 1;
  public static DEDUCTION_TYPE_FIXED_AMOUNT = 2;

  // Overtime Ids
  public static OVERTIME_TYPE_PER_MINUTE = 1;
  public static OVERTIME_TYPE_FIXED_AMOUNT = 2;

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

  // Current status of employee
  public static WORKING = 'Working';
  public static ON_BREAK = 'On Break';
  public static CHECKED_OUT = 'Checked Out';

  // Role
  public static ADMIN = 'ADMIN';
  public static USER = 'USER';
  public static MANAGER = 'MANAGER';

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
  public static STAFF_SELECTION = 2;

  // Attendance mode id
  public static MANUAL_ATTENDANCE = 1;

  // Krenai UUID
  public static KRENAI_UUID = '60811bf3-ae1e-11ee-9597-784f4361d885';

  base_url = 'http://localhost:8080/api/v2';

  /* ------------------  Staging urls ----------------*/
  //   base_url = 'https://staging.hajiri.work/api/v2';

  /* ------------------  Production urls ----------------*/
  // base_url = 'https://production.hajiri.work/api/v2';

  //subscription plan
  get_subscription = '/subcription-plan';
  get_active_user_count = '/users/active-user-count';
  get_purchased_status = '/organization-subs-plan/status';

  add_more_employee = '/organization-subs-plan/add-more-employee';

  get_invoices = '/invoices';
  get_last_invoices = '/invoices/last-invoices';
  get_due_invoices = '/invoices/due-invoices';
  get_due_pending_Status = '/invoices/due-pending-status';

  get_plan_purchased_log = '/subcription-plan-log';
  get_plan_purchased_status = '/organization-subs-plan/plan-purchased-status';

  get_org_subs_plan_month_detail = '/organization-subs-plan-month-detail';
  cancel_subscription = '/organization-subs-plan-month-detail';

  //user notification
  get_notification = '/user-notification';
  read_notification = '/user-notification/read';
  read_all_notification = '/user-notification/read-all';
  get_mail = '/user-notification/mail';

  //Coupon
  verify_coupon = '/coupon';

  check_user_email_existence = '/users/check-email-existence';
  check_user_phone_existence = '/users/check-phone-existence';

  //user import
  create_user = '/whatsapp-user-onboarding/create';

  get_onboarding_user = '/whatsapp-user-onboarding/onboarding-user';
  delete_onboarding_user = '/whatsapp-user-onboarding/delete';
  edit_onboarding_user = '/whatsapp-user-onboarding/update';

  user_import = '/whatsapp-user-onboarding/import';
  get_report = '/user-import';

  check_number_existence = '/whatsapp-user-onboarding/check-number-existence';
  check_email_existence = '/whatsapp-user-onboarding/check-email-existence';

  save_organization_onboarding_step = '/organization/save-onboarding-step';
  get_organization_onboarding_step = '/organization/onboarding-step';

  // Organization Onboarding Steps:

  //Employee Change Step
  public static NEW_JOINEE_STEP = 1;
  public static USER_EXIT_STEP = 2;
  public static FINAL_SETTLEMENT_STEP = 3;
}
