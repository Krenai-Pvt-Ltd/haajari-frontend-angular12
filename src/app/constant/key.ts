export class Key{
    public static ENDPOINT = 
    "http://localhost:8080/api/v2/attendance"
    // "https://backend.hajiri.work/api/v1/attendance"; 

    public static LOGGED_IN_USER = new Object();

     
    public static PRIVILEGE_VIEW = 1;
    public static PRIVILEGE_MANAGE = 2;
    public static PRIVILEGE_ACCESS = 3;


    public static OVERTIME_RULE = 4;


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
        "/employee-onboarding",
        "/attendance-setting",
        "/company-setting",
        "/selery-setting",
        "/role",
        "/employee-onboarding-sidebar",
        "/reports",
        "/employee-profile",
        "/leave-setting"
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
        "/employee-onboarding",
        "/attendance-setting",
        "/company-setting",
        "/selery-setting",
        "/role",
        "/employee-onboarding-sidebar",
        "/reports",
        "/employee-profile",
        "/leave-setting"
    ];
    

}