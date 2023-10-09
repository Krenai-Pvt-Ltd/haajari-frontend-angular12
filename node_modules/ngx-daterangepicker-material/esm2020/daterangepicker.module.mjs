import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DaterangepickerComponent } from './daterangepicker.component';
import { DaterangepickerDirective } from './daterangepicker.directive';
import { LOCALE_CONFIG } from './daterangepicker.config';
import { LocaleService } from './locale.service';
import * as i0 from "@angular/core";
export class NgxDaterangepickerMd {
    constructor() { }
    static forRoot(config = {}) {
        return {
            ngModule: NgxDaterangepickerMd,
            providers: [
                { provide: LOCALE_CONFIG, useValue: config },
                { provide: LocaleService, useClass: LocaleService, deps: [LOCALE_CONFIG] }
            ]
        };
    }
}
NgxDaterangepickerMd.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: NgxDaterangepickerMd, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
NgxDaterangepickerMd.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: NgxDaterangepickerMd, declarations: [DaterangepickerComponent, DaterangepickerDirective], imports: [CommonModule, FormsModule, ReactiveFormsModule], exports: [DaterangepickerComponent, DaterangepickerDirective] });
NgxDaterangepickerMd.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: NgxDaterangepickerMd, providers: [], imports: [[CommonModule, FormsModule, ReactiveFormsModule]] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: NgxDaterangepickerMd, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [DaterangepickerComponent, DaterangepickerDirective],
                    imports: [CommonModule, FormsModule, ReactiveFormsModule],
                    providers: [],
                    exports: [DaterangepickerComponent, DaterangepickerDirective]
                }]
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXJhbmdlcGlja2VyLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYXRlcmFuZ2VwaWNrZXIvZGF0ZXJhbmdlcGlja2VyLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUF1QixRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDOUQsT0FBTyxFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWxFLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3ZFLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3ZFLE9BQU8sRUFBZ0IsYUFBYSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDdkUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDOztBQVFqRCxNQUFNLE9BQU8sb0JBQW9CO0lBQy9CLGdCQUFlLENBQUM7SUFFaEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUF1QixFQUFFO1FBQ3RDLE9BQU87WUFDTCxRQUFRLEVBQUUsb0JBQW9CO1lBQzlCLFNBQVMsRUFBRTtnQkFDVCxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRTtnQkFDNUMsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUU7YUFDM0U7U0FDRixDQUFDO0lBQ0osQ0FBQzs7a0hBWFUsb0JBQW9CO21IQUFwQixvQkFBb0IsaUJBTGhCLHdCQUF3QixFQUFFLHdCQUF3QixhQUN2RCxZQUFZLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixhQUU5Qyx3QkFBd0IsRUFBRSx3QkFBd0I7bUhBRWpELG9CQUFvQixhQUhwQixFQUFFLFlBREosQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixDQUFDOzRGQUk5QyxvQkFBb0I7a0JBTmhDLFFBQVE7bUJBQUM7b0JBQ1IsWUFBWSxFQUFFLENBQUMsd0JBQXdCLEVBQUUsd0JBQXdCLENBQUM7b0JBQ2xFLE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUsbUJBQW1CLENBQUM7b0JBQ3pELFNBQVMsRUFBRSxFQUFFO29CQUNiLE9BQU8sRUFBRSxDQUFDLHdCQUF3QixFQUFFLHdCQUF3QixDQUFDO2lCQUM5RCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRm9ybXNNb2R1bGUsIFJlYWN0aXZlRm9ybXNNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cbmltcG9ydCB7IERhdGVyYW5nZXBpY2tlckNvbXBvbmVudCB9IGZyb20gJy4vZGF0ZXJhbmdlcGlja2VyLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBEYXRlcmFuZ2VwaWNrZXJEaXJlY3RpdmUgfSBmcm9tICcuL2RhdGVyYW5nZXBpY2tlci5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgTG9jYWxlQ29uZmlnLCBMT0NBTEVfQ09ORklHIH0gZnJvbSAnLi9kYXRlcmFuZ2VwaWNrZXIuY29uZmlnJztcbmltcG9ydCB7IExvY2FsZVNlcnZpY2UgfSBmcm9tICcuL2xvY2FsZS5zZXJ2aWNlJztcblxuQE5nTW9kdWxlKHtcbiAgZGVjbGFyYXRpb25zOiBbRGF0ZXJhbmdlcGlja2VyQ29tcG9uZW50LCBEYXRlcmFuZ2VwaWNrZXJEaXJlY3RpdmVdLFxuICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlLCBGb3Jtc01vZHVsZSwgUmVhY3RpdmVGb3Jtc01vZHVsZV0sXG4gIHByb3ZpZGVyczogW10sXG4gIGV4cG9ydHM6IFtEYXRlcmFuZ2VwaWNrZXJDb21wb25lbnQsIERhdGVyYW5nZXBpY2tlckRpcmVjdGl2ZV1cbn0pXG5leHBvcnQgY2xhc3MgTmd4RGF0ZXJhbmdlcGlja2VyTWQge1xuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgc3RhdGljIGZvclJvb3QoY29uZmlnOiBMb2NhbGVDb25maWcgPSB7fSk6IE1vZHVsZVdpdGhQcm92aWRlcnM8Tmd4RGF0ZXJhbmdlcGlja2VyTWQ+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IE5neERhdGVyYW5nZXBpY2tlck1kLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHsgcHJvdmlkZTogTE9DQUxFX0NPTkZJRywgdXNlVmFsdWU6IGNvbmZpZyB9LFxuICAgICAgICB7IHByb3ZpZGU6IExvY2FsZVNlcnZpY2UsIHVzZUNsYXNzOiBMb2NhbGVTZXJ2aWNlLCBkZXBzOiBbTE9DQUxFX0NPTkZJR10gfVxuICAgICAgXVxuICAgIH07XG4gIH1cbn1cbiJdfQ==