export class Routes {
    /**
    * LOGIN ROUTES START
    */
    public static LOGIN = "/auth/login";
    public static SIGNUP = "/auth/signup";
    public static SLACK_AUTH = "/auth/slackauth";
    public static SLACK_SIGN_IN = "/auth/sign-in-with-slack";

    /**
    * LOGIN ROUTES END
    */

    static AUTH_ROUTES = ['/auth/login', '/auth/signup', '/auth/otp-verification', '/auth/slackauth', '/auth/sign-in-with-slack', '/auth/addtoslack',
        '/auth/new-login', '/auth/onboarding-whatsApp-slack', '/auth/onboarding-whatapp', '/auth/organization-registration-form',
        '/auth/personal-information', '/auth/leave-rule-setup', '/auth/holiday-rule-setup',
        '/auth/automation-rules', '/auth/leave-setting-create', '/auth/add-shift-time',
        '/auth/holiday-setting', '/auth/upload-team', '/auth/attendance-mode',
        '/auth/shift-time-list', '/auth/add-shift-placeholder'];


    static LOGIN_ROUTES = [Routes.LOGIN,Routes.SIGNUP,Routes.SLACK_AUTH,Routes.SLACK_SIGN_IN ]
}