export class Key{
    public static ENDPOINT = 
    "http://localhost:8080/api/v1/attendance"
    // "https://backend.hajiri.work/api/v1/attendance"; 


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



    public static HEADER_RESTRICTION_ROUTES = ["/","/dynamic/login", "/auth/supplier-type", "/auth/industry", "/auth/register", "/auth/reset", "/auth/store-onboarding", "/auth/employee-onboarding", "/store/setting/website", "/auth/personal-details", "/auth/business-details", "/auth/payment-details"];
}