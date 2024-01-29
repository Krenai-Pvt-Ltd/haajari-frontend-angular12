export class Key{
    public static ENDPOINT = 
    "http://localhost:8080/api/v2/attendance"
    // "https://backend.hajiri.work/api/v1/attendance"; 

    public static LOGGED_IN_USER = new Object();

     
    public static PRIVILEGE_VIEW = 1;
    public static PRIVILEGE_MANAGE = 2;
    public static PRIVILEGE_ACCESS = 3;



    public static DYNAMIC = "/dynamic";
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


    public static HEADER_ROUTES = [
        "/dashboard",
        "/header",
        "/topbar",
        "/timetable",
        "/project",
        "/team",
        "/task-manager",
        "/payment",
        "/userlist",
        "/addtoslack",
        "/waiting",
        "/team-detail",
        "/user-profile",
        "/employee-onboarding-data",
        "/setting/attendance-setting",
        "/setting/company-setting",
        "/setting/selery-setting",
        "/role",
        "/employee-onboarding-sidebar",
        "/reports",
        "/employee-profile",
        "/add-role",
        "/setting/billing",
        "/setting/leave-setting",
        "/setting/account-settings",
        "/add-role",
        "/setting/billing-payment"
    ];

    public static TOPBAR_ROUTES = [
        "/dashboard",
        "/header",
        "/topbar",
        "/timetable",
        "/project",
        "/team",
        "/task-manager",
        "/payment",
        "/userlist",
        "/addtoslack",
        "/waiting",
        "/team-detail",
        "/user-profile",
        "/employee-onboarding-data",
        "/setting/attendance-setting",
        "/setting/company-setting",
        "/setting/selery-setting",
        "/role",
        "/employee-onboarding-sidebar",
        "/reports",
        "/employee-profile",
        "/add-role",
        "/setting/billing",
        "/setting/leave-setting",
        "/setting/account-settings",
        "/add-role",
        "/setting/billing-payment"
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


    public static PASTE = "paste";
    public static COPY = "copy";
    public static CUT = "cut";
    public static DELETE = "delete";
    public static EDIT = "edit";
    public static BACKSPACE = "Backspace";
    public static ENTER = "Enter";



    public static VIEW_ALL = "View All";
    public static VIEW_LESS = "View Less";



    // Toast statusResponse
    public static TOAST_STATUS_SUCCESS = "Success";
    public static TOAST_STATUS_ERROR = "Error";


    // Current status of employee
    public static WORKING = "Working";
    public static ON_BREAK  = "On Break";
    public static CHECKED_OUT = "Checked Out";



    // Role
    public static ADMIN = "ADMIN";
    public static USER = "USER";
    public static MANAGER = "MANAGER";
    
    
}