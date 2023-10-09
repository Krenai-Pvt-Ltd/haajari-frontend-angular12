import { LocaleConfig } from './daterangepicker.config';
import * as i0 from "@angular/core";
export declare class LocaleService {
    private configHolder;
    constructor(configHolder: LocaleConfig);
    get config(): LocaleConfig;
    configWithLocale(locale: any): LocaleConfig | {
        direction?: string;
        separator?: string;
        weekLabel?: string;
        applyLabel?: string;
        cancelLabel?: string;
        clearLabel?: string;
        customRangeLabel?: string;
        daysOfWeek: any;
        monthNames: any;
        firstDay: any;
        format?: string;
        displayFormat?: string;
        locale?: any;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<LocaleService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<LocaleService>;
}
