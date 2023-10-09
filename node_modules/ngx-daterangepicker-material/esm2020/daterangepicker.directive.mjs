import { Directive, ViewContainerRef, ElementRef, HostListener, forwardRef, ChangeDetectorRef, Input, KeyValueDiffers, Output, EventEmitter, Renderer2, HostBinding } from '@angular/core';
import { DaterangepickerComponent } from './daterangepicker.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import dayjs from 'dayjs/esm';
import { LocaleService } from './locale.service';
import * as i0 from "@angular/core";
import * as i1 from "./locale.service";
export class DaterangepickerDirective {
    constructor(viewContainerRef, ref, el, renderer, differs, localeHolderService, elementRef) {
        this.viewContainerRef = viewContainerRef;
        this.ref = ref;
        this.el = el;
        this.renderer = renderer;
        this.differs = differs;
        this.localeHolderService = localeHolderService;
        this.elementRef = elementRef;
        this.onChange = new EventEmitter();
        this.rangeClicked = new EventEmitter();
        this.datesUpdated = new EventEmitter();
        this.startDateChanged = new EventEmitter();
        this.endDateChanged = new EventEmitter();
        this.clearClicked = new EventEmitter();
        this.dateLimit = null;
        this.showCancel = false;
        this.lockStartDate = false;
        this.timePicker = false;
        this.timePicker24Hour = false;
        this.timePickerIncrement = 1;
        this.timePickerSeconds = false;
        this.closeOnAutoApply = true;
        this.notForChangesProperty = ['locale', 'endKey', 'startKey'];
        this.onChangeFn = Function.prototype;
        this.onTouched = Function.prototype;
        this.validatorChange = Function.prototype;
        this.localeHolder = {};
        this.endKey = 'endDate';
        this.startKey = 'startDate';
        this.drops = 'down';
        this.opens = 'auto';
        viewContainerRef.clear();
        const componentRef = viewContainerRef.createComponent(DaterangepickerComponent);
        this.picker = componentRef.instance;
        this.picker.inline = false;
    }
    get disabled() {
        return this.disabledHolder;
    }
    set startKey(value) {
        if (value !== null) {
            this.startKeyHolder = value;
        }
        else {
            this.startKeyHolder = 'startDate';
        }
    }
    get locale() {
        return this.localeHolder;
    }
    set locale(value) {
        this.localeHolder = { ...this.localeHolderService.config, ...value };
    }
    set endKey(value) {
        if (value !== null) {
            this.endKeyHolder = value;
        }
        else {
            this.endKeyHolder = 'endDate';
        }
    }
    get value() {
        return this.valueHolder || null;
    }
    set value(val) {
        this.valueHolder = val;
        this.onChangeFn(val);
        this.ref.markForCheck();
    }
    outsideClick(event) {
        if (!event.target) {
            return;
        }
        if (event.target.classList.contains('ngx-daterangepicker-action')) {
            return;
        }
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.hide();
        }
    }
    hide(e) {
        this.picker.hide(e);
    }
    onBlur() {
        this.onTouched();
    }
    inputChanged(e) {
        if (e.target.tagName.toLowerCase() !== 'input') {
            return;
        }
        if (!e.target.value.length) {
            return;
        }
        const dateString = e.target.value.split(this.picker.locale.separator);
        let start = null;
        let end = null;
        if (dateString.length === 2) {
            start = dayjs(dateString[0], this.picker.locale.format);
            end = dayjs(dateString[1], this.picker.locale.format);
        }
        if (this.singleDatePicker || start === null || end === null) {
            start = dayjs(e.target.value, this.picker.locale.format);
            end = start;
        }
        if (!start.isValid() || !end.isValid()) {
            return;
        }
        this.picker.setStartDate(start);
        this.picker.setEndDate(end);
        this.picker.updateView();
    }
    open(event) {
        if (this.disabled) {
            return;
        }
        this.picker.show(event);
        setTimeout(() => {
            this.setPosition();
        });
    }
    ngOnInit() {
        this.picker.startDateChanged.asObservable().subscribe((itemChanged) => {
            this.startDateChanged.emit(itemChanged);
        });
        this.picker.endDateChanged.asObservable().subscribe((itemChanged) => {
            this.endDateChanged.emit(itemChanged);
        });
        this.picker.rangeClicked.asObservable().subscribe((range) => {
            this.rangeClicked.emit(range);
        });
        this.picker.datesUpdated.asObservable().subscribe((range) => {
            this.datesUpdated.emit(range);
        });
        this.picker.clearClicked.asObservable().subscribe(() => {
            this.clearClicked.emit();
        });
        this.picker.choosedDate.asObservable().subscribe((change) => {
            if (change) {
                const value = {
                    [this.startKeyHolder]: change.startDate,
                    [this.endKeyHolder]: change.endDate
                };
                this.value = value;
                this.onChange.emit(value);
                if (typeof change.chosenLabel === 'string') {
                    this.el.nativeElement.value = change.chosenLabel;
                }
            }
        });
        this.picker.firstMonthDayClass = this.firstMonthDayClass;
        this.picker.lastMonthDayClass = this.lastMonthDayClass;
        this.picker.emptyWeekRowClass = this.emptyWeekRowClass;
        this.picker.emptyWeekColumnClass = this.emptyWeekColumnClass;
        this.picker.firstDayOfNextMonthClass = this.firstDayOfNextMonthClass;
        this.picker.lastDayOfPreviousMonthClass = this.lastDayOfPreviousMonthClass;
        this.picker.drops = this.drops;
        this.picker.opens = this.opens;
        this.localeDiffer = this.differs.find(this.locale).create();
        this.picker.closeOnAutoApply = this.closeOnAutoApply;
    }
    ngOnChanges(changes) {
        for (const change in changes) {
            if (Object.prototype.hasOwnProperty.call(changes, change)) {
                if (this.notForChangesProperty.indexOf(change) === -1) {
                    this.picker[change] = changes[change].currentValue;
                }
            }
        }
    }
    ngDoCheck() {
        if (this.localeDiffer) {
            const changes = this.localeDiffer.diff(this.locale);
            if (changes) {
                this.picker.updateLocale(this.locale);
            }
        }
    }
    toggle(e) {
        if (this.picker.isShown) {
            this.hide(e);
        }
        else {
            this.open(e);
        }
    }
    clear() {
        this.picker.clear();
    }
    writeValue(value) {
        this.setValue(value);
    }
    registerOnChange(fn) {
        this.onChangeFn = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(state) {
        this.disabledHolder = state;
    }
    setPosition() {
        let style;
        let containerTop;
        const container = this.picker.pickerContainer.nativeElement;
        const element = this.el.nativeElement;
        if (this.drops && this.drops === 'up') {
            containerTop = element.offsetTop - container.clientHeight + 'px';
        }
        else {
            containerTop = 'auto';
        }
        if (this.opens === 'left') {
            style = {
                top: containerTop,
                left: element.offsetLeft - container.clientWidth + element.clientWidth + 'px',
                right: 'auto'
            };
        }
        else if (this.opens === 'center') {
            style = {
                top: containerTop,
                left: element.offsetLeft + element.clientWidth / 2 - container.clientWidth / 2 + 'px',
                right: 'auto'
            };
        }
        else if (this.opens === 'right') {
            style = {
                top: containerTop,
                left: element.offsetLeft + 'px',
                right: 'auto'
            };
        }
        else {
            const position = element.offsetLeft + element.clientWidth / 2 - container.clientWidth / 2;
            if (position < 0) {
                style = {
                    top: containerTop,
                    left: element.offsetLeft + 'px',
                    right: 'auto'
                };
            }
            else {
                style = {
                    top: containerTop,
                    left: position + 'px',
                    right: 'auto'
                };
            }
        }
        if (style) {
            this.renderer.setStyle(container, 'top', style.top);
            this.renderer.setStyle(container, 'left', style.left);
            this.renderer.setStyle(container, 'right', style.right);
        }
    }
    setValue(val) {
        if (val) {
            this.value = val;
            if (val[this.startKeyHolder]) {
                this.picker.setStartDate(val[this.startKeyHolder]);
            }
            if (val[this.endKeyHolder]) {
                this.picker.setEndDate(val[this.endKeyHolder]);
            }
            this.picker.calculateChosenLabel();
            if (this.picker.chosenLabel) {
                this.el.nativeElement.value = this.picker.chosenLabel;
            }
        }
        else {
            this.picker.clear();
        }
    }
}
DaterangepickerDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: DaterangepickerDirective, deps: [{ token: i0.ViewContainerRef }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: i0.Renderer2 }, { token: i0.KeyValueDiffers }, { token: i1.LocaleService }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
DaterangepickerDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.3.11", type: DaterangepickerDirective, selector: "input[ngxDaterangepickerMd]", inputs: { minDate: "minDate", maxDate: "maxDate", autoApply: "autoApply", alwaysShowCalendars: "alwaysShowCalendars", showCustomRangeLabel: "showCustomRangeLabel", linkedCalendars: "linkedCalendars", dateLimit: "dateLimit", singleDatePicker: "singleDatePicker", showWeekNumbers: "showWeekNumbers", showISOWeekNumbers: "showISOWeekNumbers", showDropdowns: "showDropdowns", isInvalidDate: "isInvalidDate", isCustomDate: "isCustomDate", isTooltipDate: "isTooltipDate", showClearButton: "showClearButton", customRangeDirection: "customRangeDirection", ranges: "ranges", opens: "opens", drops: "drops", firstMonthDayClass: "firstMonthDayClass", lastMonthDayClass: "lastMonthDayClass", emptyWeekRowClass: "emptyWeekRowClass", emptyWeekColumnClass: "emptyWeekColumnClass", firstDayOfNextMonthClass: "firstDayOfNextMonthClass", lastDayOfPreviousMonthClass: "lastDayOfPreviousMonthClass", keepCalendarOpeningWithRange: "keepCalendarOpeningWithRange", showRangeLabelOnInput: "showRangeLabelOnInput", showCancel: "showCancel", lockStartDate: "lockStartDate", timePicker: "timePicker", timePicker24Hour: "timePicker24Hour", timePickerIncrement: "timePickerIncrement", timePickerSeconds: "timePickerSeconds", closeOnAutoApply: "closeOnAutoApply", endKeyHolder: "endKeyHolder", startKey: "startKey", locale: "locale", endKey: "endKey" }, outputs: { onChange: "change", rangeClicked: "rangeClicked", datesUpdated: "datesUpdated", startDateChanged: "startDateChanged", endDateChanged: "endDateChanged", clearClicked: "clearClicked" }, host: { listeners: { "document:click": "outsideClick($event)", "keyup.esc": "hide($event)", "blur": "onBlur()", "keyup": "inputChanged($event)", "click": "open($event)" }, properties: { "disabled": "this.disabled" } }, providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DaterangepickerDirective),
            multi: true
        }
    ], usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: DaterangepickerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[ngxDaterangepickerMd]',
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => DaterangepickerDirective),
                            multi: true
                        }
                    ]
                }]
        }], ctorParameters: function () { return [{ type: i0.ViewContainerRef }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: i0.Renderer2 }, { type: i0.KeyValueDiffers }, { type: i1.LocaleService }, { type: i0.ElementRef }]; }, propDecorators: { onChange: [{
                type: Output,
                args: ['change']
            }], rangeClicked: [{
                type: Output,
                args: ['rangeClicked']
            }], datesUpdated: [{
                type: Output,
                args: ['datesUpdated']
            }], startDateChanged: [{
                type: Output
            }], endDateChanged: [{
                type: Output
            }], clearClicked: [{
                type: Output
            }], minDate: [{
                type: Input
            }], maxDate: [{
                type: Input
            }], autoApply: [{
                type: Input
            }], alwaysShowCalendars: [{
                type: Input
            }], showCustomRangeLabel: [{
                type: Input
            }], linkedCalendars: [{
                type: Input
            }], dateLimit: [{
                type: Input
            }], singleDatePicker: [{
                type: Input
            }], showWeekNumbers: [{
                type: Input
            }], showISOWeekNumbers: [{
                type: Input
            }], showDropdowns: [{
                type: Input
            }], isInvalidDate: [{
                type: Input
            }], isCustomDate: [{
                type: Input
            }], isTooltipDate: [{
                type: Input
            }], showClearButton: [{
                type: Input
            }], customRangeDirection: [{
                type: Input
            }], ranges: [{
                type: Input
            }], opens: [{
                type: Input
            }], drops: [{
                type: Input
            }], firstMonthDayClass: [{
                type: Input
            }], lastMonthDayClass: [{
                type: Input
            }], emptyWeekRowClass: [{
                type: Input
            }], emptyWeekColumnClass: [{
                type: Input
            }], firstDayOfNextMonthClass: [{
                type: Input
            }], lastDayOfPreviousMonthClass: [{
                type: Input
            }], keepCalendarOpeningWithRange: [{
                type: Input
            }], showRangeLabelOnInput: [{
                type: Input
            }], showCancel: [{
                type: Input
            }], lockStartDate: [{
                type: Input
            }], timePicker: [{
                type: Input
            }], timePicker24Hour: [{
                type: Input
            }], timePickerIncrement: [{
                type: Input
            }], timePickerSeconds: [{
                type: Input
            }], closeOnAutoApply: [{
                type: Input
            }], endKeyHolder: [{
                type: Input
            }], disabled: [{
                type: HostBinding,
                args: ['disabled']
            }], startKey: [{
                type: Input
            }], locale: [{
                type: Input
            }], endKey: [{
                type: Input
            }], outsideClick: [{
                type: HostListener,
                args: ['document:click', ['$event']]
            }], hide: [{
                type: HostListener,
                args: ['keyup.esc', ['$event']]
            }], onBlur: [{
                type: HostListener,
                args: ['blur']
            }], inputChanged: [{
                type: HostListener,
                args: ['keyup', ['$event']]
            }], open: [{
                type: HostListener,
                args: ['click', ['$event']]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXJhbmdlcGlja2VyLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYXRlcmFuZ2VwaWNrZXIvZGF0ZXJhbmdlcGlja2VyLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsU0FBUyxFQUNULGdCQUFnQixFQUNoQixVQUFVLEVBQ1YsWUFBWSxFQUNaLFVBQVUsRUFDVixpQkFBaUIsRUFJakIsS0FBSyxFQUdMLGVBQWUsRUFDZixNQUFNLEVBQ04sWUFBWSxFQUNaLFNBQVMsRUFDVCxXQUFXLEVBQ1osTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUF5Qix3QkFBd0IsRUFBOEMsTUFBTSw2QkFBNkIsQ0FBQztBQUMxSSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNuRCxPQUFPLEtBQUssTUFBTSxXQUFXLENBQUM7QUFFOUIsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDOzs7QUFjakQsTUFBTSxPQUFPLHdCQUF3QjtJQThIbkMsWUFDUyxnQkFBa0MsRUFDbEMsR0FBc0IsRUFDckIsRUFBYyxFQUNkLFFBQW1CLEVBQ25CLE9BQXdCLEVBQ3hCLG1CQUFrQyxFQUNsQyxVQUFzQjtRQU52QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFFBQUcsR0FBSCxHQUFHLENBQW1CO1FBQ3JCLE9BQUUsR0FBRixFQUFFLENBQVk7UUFDZCxhQUFRLEdBQVIsUUFBUSxDQUFXO1FBQ25CLFlBQU8sR0FBUCxPQUFPLENBQWlCO1FBQ3hCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBZTtRQUNsQyxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBbklkLGFBQVEsR0FBb0MsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUV6RCxpQkFBWSxHQUE0QixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRTNELGlCQUFZLEdBQTZCLElBQUksWUFBWSxFQUFFLENB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O3NCQURYLFlBQVk7dUJBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDO2dCQTRCakMsSUFBSTtzQkFESCxZQUFZO3VCQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgRWxlbWVudFJlZixcbiAgSG9zdExpc3RlbmVyLFxuICBmb3J3YXJkUmVmLFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgT25Jbml0LFxuICBPbkNoYW5nZXMsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIElucHV0LFxuICBEb0NoZWNrLFxuICBLZXlWYWx1ZURpZmZlcixcbiAgS2V5VmFsdWVEaWZmZXJzLFxuICBPdXRwdXQsXG4gIEV2ZW50RW1pdHRlcixcbiAgUmVuZGVyZXIyLFxuICBIb3N0QmluZGluZ1xufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENob3NlbkRhdGUsIERhdGVSYW5nZSwgRGF0ZXJhbmdlcGlja2VyQ29tcG9uZW50LCBEYXRlUmFuZ2VzLCBFbmREYXRlLCBTdGFydERhdGUsIFRpbWVQZXJpb2QgfSBmcm9tICcuL2RhdGVyYW5nZXBpY2tlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgTkdfVkFMVUVfQUNDRVNTT1IgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgZGF5anMgZnJvbSAnZGF5anMvZXNtJztcbmltcG9ydCB7IExvY2FsZUNvbmZpZyB9IGZyb20gJy4vZGF0ZXJhbmdlcGlja2VyLmNvbmZpZyc7XG5pbXBvcnQgeyBMb2NhbGVTZXJ2aWNlIH0gZnJvbSAnLi9sb2NhbGUuc2VydmljZSc7XG5cbkBEaXJlY3RpdmUoe1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQGFuZ3VsYXItZXNsaW50L2RpcmVjdGl2ZS1zZWxlY3RvclxuICBzZWxlY3RvcjogJ2lucHV0W25neERhdGVyYW5nZXBpY2tlck1kXScsXG4gIHByb3ZpZGVyczogW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxuICAgICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gRGF0ZXJhbmdlcGlja2VyRGlyZWN0aXZlKSxcbiAgICAgIG11bHRpOiB0cnVlXG4gICAgfVxuICBdXG59KVxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEBhbmd1bGFyLWVzbGludC9uby1jb25mbGljdGluZy1saWZlY3ljbGVcbmV4cG9ydCBjbGFzcyBEYXRlcmFuZ2VwaWNrZXJEaXJlY3RpdmUgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgRG9DaGVjayB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAYW5ndWxhci1lc2xpbnQvbm8tb3V0cHV0LW9uLXByZWZpeCxAYW5ndWxhci1lc2xpbnQvbm8tb3V0cHV0LW5hdGl2ZSxAYW5ndWxhci1lc2xpbnQvbm8tb3V0cHV0LXJlbmFtZVxuICBAT3V0cHV0KCdjaGFuZ2UnKSBvbkNoYW5nZTogRXZlbnRFbWl0dGVyPFRpbWVQZXJpb2QgfCBudWxsPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEBhbmd1bGFyLWVzbGludC9uby1vdXRwdXQtcmVuYW1lXG4gIEBPdXRwdXQoJ3JhbmdlQ2xpY2tlZCcpIHJhbmdlQ2xpY2tlZDogRXZlbnRFbWl0dGVyPERhdGVSYW5nZT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAYW5ndWxhci1lc2xpbnQvbm8tb3V0cHV0LXJlbmFtZVxuICBAT3V0cHV0KCdkYXRlc1VwZGF0ZWQnKSBkYXRlc1VwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxUaW1lUGVyaW9kPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIHN0YXJ0RGF0ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxTdGFydERhdGU+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgZW5kRGF0ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxFbmREYXRlPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIGNsZWFyQ2xpY2tlZDogRXZlbnRFbWl0dGVyPHZvaWQ+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIEBJbnB1dCgpXG4gIG1pbkRhdGU6IGRheWpzLkRheWpzO1xuXG4gIEBJbnB1dCgpXG4gIG1heERhdGU6IGRheWpzLkRheWpzO1xuXG4gIEBJbnB1dCgpXG4gIGF1dG9BcHBseTogYm9vbGVhbjtcblxuICBASW5wdXQoKVxuICBhbHdheXNTaG93Q2FsZW5kYXJzOiBib29sZWFuO1xuXG4gIEBJbnB1dCgpXG4gIHNob3dDdXN0b21SYW5nZUxhYmVsOiBib29sZWFuO1xuXG4gIEBJbnB1dCgpXG4gIGxpbmtlZENhbGVuZGFyczogYm9vbGVhbjtcblxuICBASW5wdXQoKVxuICBkYXRlTGltaXQ6IG51bWJlciA9IG51bGw7XG5cbiAgQElucHV0KClcbiAgc2luZ2xlRGF0ZVBpY2tlcjogYm9vbGVhbjtcblxuICBASW5wdXQoKVxuICBzaG93V2Vla051bWJlcnM6IGJvb2xlYW47XG5cbiAgQElucHV0KClcbiAgc2hvd0lTT1dlZWtOdW1iZXJzOiBib29sZWFuO1xuXG4gIEBJbnB1dCgpXG4gIHNob3dEcm9wZG93bnM6IGJvb2xlYW47XG5cbiAgQElucHV0KClcbiAgaXNJbnZhbGlkRGF0ZTogKERheWpzKSA9PiBib29sZWFuO1xuXG4gIEBJbnB1dCgpXG4gIGlzQ3VzdG9tRGF0ZTogKERheWpzKSA9PiBzdHJpbmcgfCBib29sZWFuO1xuXG4gIEBJbnB1dCgpXG4gIGlzVG9vbHRpcERhdGU6IChEYXlqcykgPT4gc3RyaW5nIHwgYm9vbGVhbiB8IG51bGw7XG5cbiAgQElucHV0KClcbiAgc2hvd0NsZWFyQnV0dG9uOiBib29sZWFuO1xuXG4gIEBJbnB1dCgpXG4gIGN1c3RvbVJhbmdlRGlyZWN0aW9uOiBib29sZWFuO1xuXG4gIEBJbnB1dCgpXG4gIHJhbmdlczogRGF0ZVJhbmdlcztcblxuICBASW5wdXQoKVxuICBvcGVuczogc3RyaW5nO1xuXG4gIEBJbnB1dCgpXG4gIGRyb3BzOiBzdHJpbmc7XG5cbiAgQElucHV0KClcbiAgZmlyc3RNb250aERheUNsYXNzOiBzdHJpbmc7XG5cbiAgQElucHV0KClcbiAgbGFzdE1vbnRoRGF5Q2xhc3M6IHN0cmluZztcblxuICBASW5wdXQoKVxuICBlbXB0eVdlZWtSb3dDbGFzczogc3RyaW5nO1xuXG4gIEBJbnB1dCgpXG4gIGVtcHR5V2Vla0NvbHVtbkNsYXNzOiBzdHJpbmc7XG5cbiAgQElucHV0KClcbiAgZmlyc3REYXlPZk5leHRNb250aENsYXNzOiBzdHJpbmc7XG5cbiAgQElucHV0KClcbiAgbGFzdERheU9mUHJldmlvdXNNb250aENsYXNzOiBzdHJpbmc7XG5cbiAgQElucHV0KClcbiAga2VlcENhbGVuZGFyT3BlbmluZ1dpdGhSYW5nZTogYm9vbGVhbjtcblxuICBASW5wdXQoKVxuICBzaG93UmFuZ2VMYWJlbE9uSW5wdXQ6IGJvb2xlYW47XG5cbiAgQElucHV0KClcbiAgc2hvd0NhbmNlbCA9IGZhbHNlO1xuXG4gIEBJbnB1dCgpXG4gIGxvY2tTdGFydERhdGUgPSBmYWxzZTtcblxuICAvLyB0aW1lcGlja2VyIHZhcmlhYmxlc1xuICBASW5wdXQoKVxuICB0aW1lUGlja2VyID0gZmFsc2U7XG5cbiAgQElucHV0KClcbiAgdGltZVBpY2tlcjI0SG91ciA9IGZhbHNlO1xuXG4gIEBJbnB1dCgpXG4gIHRpbWVQaWNrZXJJbmNyZW1lbnQgPSAxO1xuXG4gIEBJbnB1dCgpXG4gIHRpbWVQaWNrZXJTZWNvbmRzID0gZmFsc2U7XG5cbiAgQElucHV0KCkgY2xvc2VPbkF1dG9BcHBseSA9IHRydWU7XG4gIEBJbnB1dCgpXG4gIHByaXZhdGUgZW5kS2V5SG9sZGVyOiBzdHJpbmc7XG5cbiAgcHVibGljIHBpY2tlcjogRGF0ZXJhbmdlcGlja2VyQ29tcG9uZW50O1xuICBwcml2YXRlIHN0YXJ0S2V5SG9sZGVyOiBzdHJpbmc7XG4gIHByaXZhdGUgbm90Rm9yQ2hhbmdlc1Byb3BlcnR5OiBBcnJheTxzdHJpbmc+ID0gWydsb2NhbGUnLCAnZW5kS2V5JywgJ3N0YXJ0S2V5J107XG4gIHByaXZhdGUgb25DaGFuZ2VGbiA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcbiAgcHJpdmF0ZSBvblRvdWNoZWQgPSBGdW5jdGlvbi5wcm90b3R5cGU7XG4gIHByaXZhdGUgdmFsaWRhdG9yQ2hhbmdlID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuICBwcml2YXRlIGRpc2FibGVkSG9sZGVyOiBib29sZWFuO1xuICBwcml2YXRlIHZhbHVlSG9sZGVyOiBUaW1lUGVyaW9kIHwgbnVsbDtcbiAgcHJpdmF0ZSBsb2NhbGVEaWZmZXI6IEtleVZhbHVlRGlmZmVyPHN0cmluZywgYW55PjtcbiAgcHJpdmF0ZSBsb2NhbGVIb2xkZXI6IExvY2FsZUNvbmZpZyA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIHB1YmxpYyByZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHByaXZhdGUgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHJpdmF0ZSByZW5kZXJlcjogUmVuZGVyZXIyLFxuICAgIHByaXZhdGUgZGlmZmVyczogS2V5VmFsdWVEaWZmZXJzLFxuICAgIHByaXZhdGUgbG9jYWxlSG9sZGVyU2VydmljZTogTG9jYWxlU2VydmljZSxcbiAgICBwcml2YXRlIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWZcbiAgKSB7XG4gICAgdGhpcy5lbmRLZXkgPSAnZW5kRGF0ZSc7XG4gICAgdGhpcy5zdGFydEtleSA9ICdzdGFydERhdGUnO1xuICAgIHRoaXMuZHJvcHMgPSAnZG93bic7XG4gICAgdGhpcy5vcGVucyA9ICdhdXRvJztcbiAgICB2aWV3Q29udGFpbmVyUmVmLmNsZWFyKCk7XG4gICAgY29uc3QgY29tcG9uZW50UmVmID0gdmlld0NvbnRhaW5lclJlZi5jcmVhdGVDb21wb25lbnQoRGF0ZXJhbmdlcGlja2VyQ29tcG9uZW50KTtcbiAgICB0aGlzLnBpY2tlciA9IGNvbXBvbmVudFJlZi5pbnN0YW5jZSBhcyBEYXRlcmFuZ2VwaWNrZXJDb21wb25lbnQ7XG4gICAgdGhpcy5waWNrZXIuaW5saW5lID0gZmFsc2U7IC8vIHNldCBpbmxpbmUgdG8gZmFsc2UgZm9yIGFsbCBkaXJlY3RpdmUgdXNhZ2VcbiAgfVxuXG4gIEBIb3N0QmluZGluZygnZGlzYWJsZWQnKSBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZGlzYWJsZWRIb2xkZXI7XG4gIH1cblxuICBASW5wdXQoKSBzZXQgc3RhcnRLZXkodmFsdWU6IHN0cmluZykge1xuICAgIGlmICh2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5zdGFydEtleUhvbGRlciA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YXJ0S2V5SG9sZGVyID0gJ3N0YXJ0RGF0ZSc7XG4gICAgfVxuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9tZW1iZXItb3JkZXJpbmdcbiAgZ2V0IGxvY2FsZSgpOiBMb2NhbGVDb25maWcge1xuICAgIHJldHVybiB0aGlzLmxvY2FsZUhvbGRlcjtcbiAgfVxuXG4gIEBJbnB1dCgpIHNldCBsb2NhbGUodmFsdWU6IExvY2FsZUNvbmZpZykge1xuICAgIHRoaXMubG9jYWxlSG9sZGVyID0geyAuLi50aGlzLmxvY2FsZUhvbGRlclNlcnZpY2UuY29uZmlnLCAuLi52YWx1ZSB9O1xuICB9XG5cbiAgQElucHV0KCkgc2V0IGVuZEtleSh2YWx1ZTogc3RyaW5nKSB7XG4gICAgaWYgKHZhbHVlICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmVuZEtleUhvbGRlciA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVuZEtleUhvbGRlciA9ICdlbmREYXRlJztcbiAgICB9XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L21lbWJlci1vcmRlcmluZ1xuICBnZXQgdmFsdWUoKTogVGltZVBlcmlvZCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLnZhbHVlSG9sZGVyIHx8IG51bGw7XG4gIH1cblxuICBzZXQgdmFsdWUodmFsOiBUaW1lUGVyaW9kIHwgbnVsbCkge1xuICAgIHRoaXMudmFsdWVIb2xkZXIgPSB2YWw7XG4gICAgdGhpcy5vbkNoYW5nZUZuKHZhbCk7XG4gICAgdGhpcy5yZWYubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogRm9yIGNsaWNrIG91dHNpZGUgdGhlIGNhbGVuZGFyJ3MgY29udGFpbmVyXG4gICAqXG4gICAqIEBwYXJhbSBldmVudCBldmVudCBvYmplY3RcbiAgICovXG4gIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50OmNsaWNrJywgWyckZXZlbnQnXSlcbiAgb3V0c2lkZUNsaWNrKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGlmICghZXZlbnQudGFyZ2V0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKChldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmNsYXNzTGlzdC5jb250YWlucygnbmd4LWRhdGVyYW5nZXBpY2tlci1hY3Rpb24nKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkge1xuICAgICAgdGhpcy5oaWRlKCk7XG4gICAgfVxuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcigna2V5dXAuZXNjJywgWyckZXZlbnQnXSlcbiAgaGlkZShlPzogRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLnBpY2tlci5oaWRlKGUpO1xuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcignYmx1cicpXG4gIG9uQmx1cigpOiB2b2lkIHtcbiAgICB0aGlzLm9uVG91Y2hlZCgpO1xuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcigna2V5dXAnLCBbJyRldmVudCddKVxuICBpbnB1dENoYW5nZWQoZTogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xuICAgIGlmICgoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPT0gJ2lucHV0Jykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIShlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZS5sZW5ndGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZGF0ZVN0cmluZyA9IChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZS5zcGxpdCh0aGlzLnBpY2tlci5sb2NhbGUuc2VwYXJhdG9yKTtcbiAgICBsZXQgc3RhcnQgPSBudWxsO1xuICAgIGxldCBlbmQgPSBudWxsO1xuICAgIGlmIChkYXRlU3RyaW5nLmxlbmd0aCA9PT0gMikge1xuICAgICAgc3RhcnQgPSBkYXlqcyhkYXRlU3RyaW5nWzBdLCB0aGlzLnBpY2tlci5sb2NhbGUuZm9ybWF0KTtcbiAgICAgIGVuZCA9IGRheWpzKGRhdGVTdHJpbmdbMV0sIHRoaXMucGlja2VyLmxvY2FsZS5mb3JtYXQpO1xuICAgIH1cbiAgICBpZiAodGhpcy5zaW5nbGVEYXRlUGlja2VyIHx8IHN0YXJ0ID09PSBudWxsIHx8IGVuZCA9PT0gbnVsbCkge1xuICAgICAgc3RhcnQgPSBkYXlqcygoZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUsIHRoaXMucGlja2VyLmxvY2FsZS5mb3JtYXQpO1xuICAgICAgZW5kID0gc3RhcnQ7XG4gICAgfVxuICAgIGlmICghc3RhcnQuaXNWYWxpZCgpIHx8ICFlbmQuaXNWYWxpZCgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucGlja2VyLnNldFN0YXJ0RGF0ZShzdGFydCk7XG4gICAgdGhpcy5waWNrZXIuc2V0RW5kRGF0ZShlbmQpO1xuICAgIHRoaXMucGlja2VyLnVwZGF0ZVZpZXcoKTtcbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2NsaWNrJywgWyckZXZlbnQnXSlcbiAgb3BlbihldmVudD86IEV2ZW50KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5waWNrZXIuc2hvdyhldmVudCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLnNldFBvc2l0aW9uKCk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQGFuZ3VsYXItZXNsaW50L25vLWNvbmZsaWN0aW5nLWxpZmVjeWNsZVxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLnBpY2tlci5zdGFydERhdGVDaGFuZ2VkLmFzT2JzZXJ2YWJsZSgpLnN1YnNjcmliZSgoaXRlbUNoYW5nZWQ6IFN0YXJ0RGF0ZSkgPT4ge1xuICAgICAgdGhpcy5zdGFydERhdGVDaGFuZ2VkLmVtaXQoaXRlbUNoYW5nZWQpO1xuICAgIH0pO1xuICAgIHRoaXMucGlja2VyLmVuZERhdGVDaGFuZ2VkLmFzT2JzZXJ2YWJsZSgpLnN1YnNjcmliZSgoaXRlbUNoYW5nZWQ6IEVuZERhdGUpID0+IHtcbiAgICAgIHRoaXMuZW5kRGF0ZUNoYW5nZWQuZW1pdChpdGVtQ2hhbmdlZCk7XG4gICAgfSk7XG4gICAgdGhpcy5waWNrZXIucmFuZ2VDbGlja2VkLmFzT2JzZXJ2YWJsZSgpLnN1YnNjcmliZSgocmFuZ2U6IERhdGVSYW5nZSkgPT4ge1xuICAgICAgdGhpcy5yYW5nZUNsaWNrZWQuZW1pdChyYW5nZSk7XG4gICAgfSk7XG4gICAgdGhpcy5waWNrZXIuZGF0ZXNVcGRhdGVkLmFzT2JzZXJ2YWJsZSgpLnN1YnNjcmliZSgocmFuZ2U6IFRpbWVQZXJpb2QpID0+IHtcbiAgICAgIHRoaXMuZGF0ZXNVcGRhdGVkLmVtaXQocmFuZ2UpO1xuICAgIH0pO1xuICAgIHRoaXMucGlja2VyLmNsZWFyQ2xpY2tlZC5hc09ic2VydmFibGUoKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5jbGVhckNsaWNrZWQuZW1pdCgpO1xuICAgIH0pO1xuICAgIHRoaXMucGlja2VyLmNob29zZWREYXRlLmFzT2JzZXJ2YWJsZSgpLnN1YnNjcmliZSgoY2hhbmdlOiBDaG9zZW5EYXRlKSA9PiB7XG4gICAgICBpZiAoY2hhbmdlKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0ge1xuICAgICAgICAgIFt0aGlzLnN0YXJ0S2V5SG9sZGVyXTogY2hhbmdlLnN0YXJ0RGF0ZSxcbiAgICAgICAgICBbdGhpcy5lbmRLZXlIb2xkZXJdOiBjaGFuZ2UuZW5kRGF0ZVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWUgYXMgVGltZVBlcmlvZDtcbiAgICAgICAgdGhpcy5vbkNoYW5nZS5lbWl0KHZhbHVlIGFzIFRpbWVQZXJpb2QpO1xuICAgICAgICBpZiAodHlwZW9mIGNoYW5nZS5jaG9zZW5MYWJlbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQudmFsdWUgPSBjaGFuZ2UuY2hvc2VuTGFiZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLnBpY2tlci5maXJzdE1vbnRoRGF5Q2xhc3MgPSB0aGlzLmZpcnN0TW9udGhEYXlDbGFzcztcbiAgICB0aGlzLnBpY2tlci5sYXN0TW9udGhEYXlDbGFzcyA9IHRoaXMubGFzdE1vbnRoRGF5Q2xhc3M7XG4gICAgdGhpcy5waWNrZXIuZW1wdHlXZWVrUm93Q2xhc3MgPSB0aGlzLmVtcHR5V2Vla1Jvd0NsYXNzO1xuICAgIHRoaXMucGlja2VyLmVtcHR5V2Vla0NvbHVtbkNsYXNzID0gdGhpcy5lbXB0eVdlZWtDb2x1bW5DbGFzcztcbiAgICB0aGlzLnBpY2tlci5maXJzdERheU9mTmV4dE1vbnRoQ2xhc3MgPSB0aGlzLmZpcnN0RGF5T2ZOZXh0TW9udGhDbGFzcztcbiAgICB0aGlzLnBpY2tlci5sYXN0RGF5T2ZQcmV2aW91c01vbnRoQ2xhc3MgPSB0aGlzLmxhc3REYXlPZlByZXZpb3VzTW9udGhDbGFzcztcbiAgICB0aGlzLnBpY2tlci5kcm9wcyA9IHRoaXMuZHJvcHM7XG4gICAgdGhpcy5waWNrZXIub3BlbnMgPSB0aGlzLm9wZW5zO1xuICAgIHRoaXMubG9jYWxlRGlmZmVyID0gdGhpcy5kaWZmZXJzLmZpbmQodGhpcy5sb2NhbGUpLmNyZWF0ZSgpO1xuICAgIHRoaXMucGlja2VyLmNsb3NlT25BdXRvQXBwbHkgPSB0aGlzLmNsb3NlT25BdXRvQXBwbHk7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQGFuZ3VsYXItZXNsaW50L25vLWNvbmZsaWN0aW5nLWxpZmVjeWNsZVxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBjaGFuZ2UgaW4gY2hhbmdlcykge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjaGFuZ2VzLCBjaGFuZ2UpKSB7XG4gICAgICAgIGlmICh0aGlzLm5vdEZvckNoYW5nZXNQcm9wZXJ0eS5pbmRleE9mKGNoYW5nZSkgPT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5waWNrZXJbY2hhbmdlXSA9IGNoYW5nZXNbY2hhbmdlXS5jdXJyZW50VmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQGFuZ3VsYXItZXNsaW50L25vLWNvbmZsaWN0aW5nLWxpZmVjeWNsZVxuICBuZ0RvQ2hlY2soKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubG9jYWxlRGlmZmVyKSB7XG4gICAgICBjb25zdCBjaGFuZ2VzID0gdGhpcy5sb2NhbGVEaWZmZXIuZGlmZih0aGlzLmxvY2FsZSk7XG4gICAgICBpZiAoY2hhbmdlcykge1xuICAgICAgICB0aGlzLnBpY2tlci51cGRhdGVMb2NhbGUodGhpcy5sb2NhbGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRvZ2dsZShlPzogRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5waWNrZXIuaXNTaG93bikge1xuICAgICAgdGhpcy5oaWRlKGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9wZW4oZSk7XG4gICAgfVxuICB9XG5cbiAgY2xlYXIoKTogdm9pZCB7XG4gICAgdGhpcy5waWNrZXIuY2xlYXIoKTtcbiAgfVxuXG4gIHdyaXRlVmFsdWUodmFsdWU6IFRpbWVQZXJpb2QpOiB2b2lkIHtcbiAgICB0aGlzLnNldFZhbHVlKHZhbHVlKTtcbiAgfVxuXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46ICgpID0+IFRpbWVQZXJpb2QgfCBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5vbkNoYW5nZUZuID0gZm47XG4gIH1cblxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMub25Ub3VjaGVkID0gZm47XG4gIH1cblxuICBzZXREaXNhYmxlZFN0YXRlKHN0YXRlOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5kaXNhYmxlZEhvbGRlciA9IHN0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBwb3NpdGlvbiBvZiB0aGUgY2FsZW5kYXJcbiAgICovXG4gIHNldFBvc2l0aW9uKCk6IHZvaWQge1xuICAgIGxldCBzdHlsZTtcbiAgICBsZXQgY29udGFpbmVyVG9wO1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMucGlja2VyLnBpY2tlckNvbnRhaW5lci5uYXRpdmVFbGVtZW50O1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQ7XG4gICAgaWYgKHRoaXMuZHJvcHMgJiYgdGhpcy5kcm9wcyA9PT0gJ3VwJykge1xuICAgICAgY29udGFpbmVyVG9wID0gZWxlbWVudC5vZmZzZXRUb3AgLSBjb250YWluZXIuY2xpZW50SGVpZ2h0ICsgJ3B4JztcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGFpbmVyVG9wID0gJ2F1dG8nO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcGVucyA9PT0gJ2xlZnQnKSB7XG4gICAgICBzdHlsZSA9IHtcbiAgICAgICAgdG9wOiBjb250YWluZXJUb3AsXG4gICAgICAgIGxlZnQ6IGVsZW1lbnQub2Zmc2V0TGVmdCAtIGNvbnRhaW5lci5jbGllbnRXaWR0aCArIGVsZW1lbnQuY2xpZW50V2lkdGggKyAncHgnLFxuICAgICAgICByaWdodDogJ2F1dG8nXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAodGhpcy5vcGVucyA9PT0gJ2NlbnRlcicpIHtcbiAgICAgIHN0eWxlID0ge1xuICAgICAgICB0b3A6IGNvbnRhaW5lclRvcCxcbiAgICAgICAgbGVmdDogZWxlbWVudC5vZmZzZXRMZWZ0ICsgZWxlbWVudC5jbGllbnRXaWR0aCAvIDIgLSBjb250YWluZXIuY2xpZW50V2lkdGggLyAyICsgJ3B4JyxcbiAgICAgICAgcmlnaHQ6ICdhdXRvJ1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHRoaXMub3BlbnMgPT09ICdyaWdodCcpIHtcbiAgICAgIHN0eWxlID0ge1xuICAgICAgICB0b3A6IGNvbnRhaW5lclRvcCxcbiAgICAgICAgbGVmdDogZWxlbWVudC5vZmZzZXRMZWZ0ICsgJ3B4JyxcbiAgICAgICAgcmlnaHQ6ICdhdXRvJ1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcG9zaXRpb24gPSBlbGVtZW50Lm9mZnNldExlZnQgKyBlbGVtZW50LmNsaWVudFdpZHRoIC8gMiAtIGNvbnRhaW5lci5jbGllbnRXaWR0aCAvIDI7XG4gICAgICBpZiAocG9zaXRpb24gPCAwKSB7XG4gICAgICAgIHN0eWxlID0ge1xuICAgICAgICAgIHRvcDogY29udGFpbmVyVG9wLFxuICAgICAgICAgIGxlZnQ6IGVsZW1lbnQub2Zmc2V0TGVmdCArICdweCcsXG4gICAgICAgICAgcmlnaHQ6ICdhdXRvJ1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3R5bGUgPSB7XG4gICAgICAgICAgdG9wOiBjb250YWluZXJUb3AsXG4gICAgICAgICAgbGVmdDogcG9zaXRpb24gKyAncHgnLFxuICAgICAgICAgIHJpZ2h0OiAnYXV0bydcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHN0eWxlKSB7XG4gICAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKGNvbnRhaW5lciwgJ3RvcCcsIHN0eWxlLnRvcCk7XG4gICAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKGNvbnRhaW5lciwgJ2xlZnQnLCBzdHlsZS5sZWZ0KTtcbiAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoY29udGFpbmVyLCAncmlnaHQnLCBzdHlsZS5yaWdodCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzZXRWYWx1ZSh2YWw6IFRpbWVQZXJpb2QpIHtcbiAgICBpZiAodmFsKSB7XG4gICAgICB0aGlzLnZhbHVlID0gdmFsO1xuICAgICAgaWYgKHZhbFt0aGlzLnN0YXJ0S2V5SG9sZGVyXSkge1xuICAgICAgICB0aGlzLnBpY2tlci5zZXRTdGFydERhdGUodmFsW3RoaXMuc3RhcnRLZXlIb2xkZXJdKTtcbiAgICAgIH1cbiAgICAgIGlmICh2YWxbdGhpcy5lbmRLZXlIb2xkZXJdKSB7XG4gICAgICAgIHRoaXMucGlja2VyLnNldEVuZERhdGUodmFsW3RoaXMuZW5kS2V5SG9sZGVyXSk7XG4gICAgICB9XG4gICAgICB0aGlzLnBpY2tlci5jYWxjdWxhdGVDaG9zZW5MYWJlbCgpO1xuICAgICAgaWYgKHRoaXMucGlja2VyLmNob3NlbkxhYmVsKSB7XG4gICAgICAgIHRoaXMuZWwubmF0aXZlRWxlbWVudC52YWx1ZSA9IHRoaXMucGlja2VyLmNob3NlbkxhYmVsO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnBpY2tlci5jbGVhcigpO1xuICAgIH1cbiAgfVxufVxuIl19