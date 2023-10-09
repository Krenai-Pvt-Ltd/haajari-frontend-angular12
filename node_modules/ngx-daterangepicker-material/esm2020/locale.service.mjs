import { Injectable, Inject } from '@angular/core';
import { LOCALE_CONFIG, DefaultLocaleConfig } from './daterangepicker.config';
import * as i0 from "@angular/core";
export class LocaleService {
    constructor(configHolder) {
        this.configHolder = configHolder;
    }
    get config() {
        if (!this.configHolder) {
            return DefaultLocaleConfig;
        }
        return { ...DefaultLocaleConfig, ...this.configHolder };
    }
    configWithLocale(locale) {
        if (!this.configHolder && !locale) {
            return DefaultLocaleConfig;
        }
        return {
            ...DefaultLocaleConfig,
            ...{ daysOfWeek: locale.weekdaysMin, monthNames: locale.monthsShort, firstDay: locale.weekStart },
            ...this.configHolder
        };
    }
}
LocaleService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: LocaleService, deps: [{ token: LOCALE_CONFIG }], target: i0.ɵɵFactoryTarget.Injectable });
LocaleService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: LocaleService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: LocaleService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [LOCALE_CONFIG]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGF0ZXJhbmdlcGlja2VyL2xvY2FsZS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ25ELE9BQU8sRUFBRSxhQUFhLEVBQUUsbUJBQW1CLEVBQWdCLE1BQU0sMEJBQTBCLENBQUM7O0FBRzVGLE1BQU0sT0FBTyxhQUFhO0lBQ3hCLFlBQTJDLFlBQTBCO1FBQTFCLGlCQUFZLEdBQVosWUFBWSxDQUFjO0lBQUcsQ0FBQztJQUV6RSxJQUFJLE1BQU07UUFDUixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUN0QixPQUFPLG1CQUFtQixDQUFDO1NBQzVCO1FBQ0QsT0FBTyxFQUFFLEdBQUcsbUJBQW1CLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDMUQsQ0FBQztJQUVELGdCQUFnQixDQUFDLE1BQU07UUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDakMsT0FBTyxtQkFBbUIsQ0FBQztTQUM1QjtRQUNELE9BQU87WUFDTCxHQUFHLG1CQUFtQjtZQUN0QixHQUFHLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxTQUFTLEVBQUU7WUFDakcsR0FBRyxJQUFJLENBQUMsWUFBWTtTQUNyQixDQUFDO0lBQ0osQ0FBQzs7MkdBbkJVLGFBQWEsa0JBQ0osYUFBYTsrR0FEdEIsYUFBYTs0RkFBYixhQUFhO2tCQUR6QixVQUFVOzswQkFFSSxNQUFNOzJCQUFDLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBJbmplY3QgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IExPQ0FMRV9DT05GSUcsIERlZmF1bHRMb2NhbGVDb25maWcsIExvY2FsZUNvbmZpZyB9IGZyb20gJy4vZGF0ZXJhbmdlcGlja2VyLmNvbmZpZyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBMb2NhbGVTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoQEluamVjdChMT0NBTEVfQ09ORklHKSBwcml2YXRlIGNvbmZpZ0hvbGRlcjogTG9jYWxlQ29uZmlnKSB7fVxuXG4gIGdldCBjb25maWcoKSB7XG4gICAgaWYgKCF0aGlzLmNvbmZpZ0hvbGRlcikge1xuICAgICAgcmV0dXJuIERlZmF1bHRMb2NhbGVDb25maWc7XG4gICAgfVxuICAgIHJldHVybiB7IC4uLkRlZmF1bHRMb2NhbGVDb25maWcsIC4uLnRoaXMuY29uZmlnSG9sZGVyIH07XG4gIH1cblxuICBjb25maWdXaXRoTG9jYWxlKGxvY2FsZSkge1xuICAgIGlmICghdGhpcy5jb25maWdIb2xkZXIgJiYgIWxvY2FsZSkge1xuICAgICAgcmV0dXJuIERlZmF1bHRMb2NhbGVDb25maWc7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAuLi5EZWZhdWx0TG9jYWxlQ29uZmlnLFxuICAgICAgLi4ueyBkYXlzT2ZXZWVrOiBsb2NhbGUud2Vla2RheXNNaW4sIG1vbnRoTmFtZXM6IGxvY2FsZS5tb250aHNTaG9ydCwgZmlyc3REYXk6IGxvY2FsZS53ZWVrU3RhcnQgfSxcbiAgICAgIC4uLnRoaXMuY29uZmlnSG9sZGVyXG4gICAgfTtcbiAgfVxufVxuIl19