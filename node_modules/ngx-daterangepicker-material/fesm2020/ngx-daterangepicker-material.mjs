import * as i2 from '@angular/common';
import { CommonModule } from '@angular/common';
import * as i0 from '@angular/core';
import { InjectionToken, Injectable, Inject, EventEmitter, forwardRef, Component, ViewEncapsulation, Input, Output, ViewChild, HostListener, Directive, HostBinding, NgModule } from '@angular/core';
import * as i3 from '@angular/forms';
import { FormControl, NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule } from '@angular/forms';
import dayjs from 'dayjs/esm';
import localeData from 'dayjs/esm/plugin/localeData';
import LocalizedFormat from 'dayjs/esm/plugin/localizedFormat';
import isoWeek from 'dayjs/esm/plugin/isoWeek';
import week from 'dayjs/esm/plugin/weekOfYear';
import customParseFormat from 'dayjs/esm/plugin/customParseFormat';
import utc from 'dayjs/esm/plugin/utc';

dayjs.extend(localeData);
const LOCALE_CONFIG = new InjectionToken('daterangepicker.config');
const DefaultLocaleConfig = {
    direction: 'ltr',
    separator: ' - ',
    weekLabel: 'W',
    applyLabel: 'Apply',
    cancelLabel: 'Cancel',
    clearLabel: 'Clear',
    customRangeLabel: 'Custom range',
    daysOfWeek: dayjs.weekdaysMin(),
    monthNames: dayjs.monthsShort(),
    firstDay: dayjs.localeData().firstDayOfWeek()
};

class LocaleService {
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

dayjs.extend(localeData);
dayjs.extend(LocalizedFormat);
dayjs.extend(isoWeek);
dayjs.extend(week);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
var SideEnum;
(function (SideEnum) {
    SideEnum["left"] = "left";
    SideEnum["right"] = "right";
})(SideEnum || (SideEnum = {}));
class DaterangepickerComponent {
    constructor(el, ref, localeHolderService) {
        this.el = el;
        this.ref = ref;
        this.localeHolderService = localeHolderService;
        this.startDate = dayjs().utc(true).startOf('day');
        this.endDate = dayjs().utc(true).endOf('day');
        this.dateLimit = null;
        this.autoApply = false;
        this.singleDatePicker = false;
        this.showDropdowns = false;
        this.showWeekNumbers = false;
        this.showISOWeekNumbers = false;
        this.linkedCalendars = false;
        this.autoUpdateInput = true;
        this.alwaysShowCalendars = false;
        this.maxSpan = false;
        this.lockStartDate = false;
        this.timePicker = false;
        this.timePicker24Hour = false;
        this.timePickerIncrement = 1;
        this.timePickerSeconds = false;
        this.showClearButton = false;
        this.firstMonthDayClass = null;
        this.lastMonthDayClass = null;
        this.emptyWeekRowClass = null;
        this.emptyWeekColumnClass = null;
        this.firstDayOfNextMonthClass = null;
        this.lastDayOfPreviousMonthClass = null;
        this.showCancel = false;
        this.keepCalendarOpeningWithRange = false;
        this.showRangeLabelOnInput = false;
        this.customRangeDirection = false;
        this.closeOnAutoApply = true;
        this.calendarVariables = {};
        this.timepickerVariables = {};
        this.daterangepicker = { start: new FormControl(), end: new FormControl() };
        this.applyBtn = { disabled: false };
        this.sideEnum = SideEnum;
        this.rangesArray = [];
        this.isShown = false;
        this.inline = true;
        this.leftCalendar = { month: null, calendar: [] };
        this.rightCalendar = { month: null, calendar: [] };
        this.showCalInRanges = false;
        this.nowHoveredDate = null;
        this.pickingDate = false;
        this.localeHolder = {};
        this.rangesHolder = {};
        this.cachedVersion = { start: null, end: null };
        this.clickNext = (side) => {
            if (side === SideEnum.left) {
                this.leftCalendar.month = this.leftCalendar.month.add(1, 'month');
            }
            else {
                this.rightCalendar.month = this.rightCalendar.month.add(1, 'month');
                if (this.linkedCalendars) {
                    this.leftCalendar.month = this.leftCalendar.month.add(1, 'month');
                }
            }
            this.updateCalendars();
        };
        this.choosedDate = new EventEmitter();
        this.rangeClicked = new EventEmitter();
        this.datesUpdated = new EventEmitter();
        this.startDateChanged = new EventEmitter();
        this.endDateChanged = new EventEmitter();
        this.cancelClicked = new EventEmitter();
        this.clearClicked = new EventEmitter();
    }
    get minDate() {
        return this.minDateHolder;
    }
    set minDate(value) {
        if (dayjs.isDayjs(value)) {
            this.minDateHolder = value;
        }
        else if (typeof value === 'string') {
            this.minDateHolder = dayjs(value).utc(true);
        }
        else {
            this.minDateHolder = null;
        }
    }
    get locale() {
        return this.localeHolder;
    }
    set locale(value) {
        this.localeHolder = { ...this.localeHolderService.config, ...value };
        if (value.locale) {
            this.localeHolder = this.localeHolderService.configWithLocale(value.locale);
        }
    }
    get ranges() {
        return this.rangesHolder;
    }
    set ranges(value) {
        this.rangesHolder = value;
        this.renderRanges();
    }
    get maxDate() {
        return this.maxDateHolder;
    }
    set maxDate(value) {
        if (dayjs.isDayjs(value)) {
            this.maxDateHolder = value;
        }
        else if (typeof value === 'string') {
            this.maxDateHolder = dayjs(value).utc(true);
        }
        else {
            this.maxDateHolder = null;
        }
    }
    isInvalidDate(date) {
        return false;
    }
    isCustomDate(date) {
        return false;
    }
    isTooltipDate(date) {
        return null;
    }
    handleInternalClick(e) {
        return e.stopPropagation();
    }
    ngOnChanges(changes) {
        if ((changes.startDate || changes.endDate) && this.inline) {
            this.updateView();
        }
    }
    ngOnInit() {
        this.buildLocale();
        const daysOfWeek = [...this.locale.daysOfWeek];
        this.locale.firstDay = this.locale.firstDay % 7;
        if (this.locale.firstDay !== 0) {
            let iterator = this.locale.firstDay;
            while (iterator > 0) {
                daysOfWeek.push(daysOfWeek.shift());
                iterator--;
            }
        }
        this.locale.daysOfWeek = daysOfWeek;
        if (this.inline) {
            this.cachedVersion.start = this.startDate.clone();
            this.cachedVersion.end = this.endDate.clone();
        }
        if (this.startDate && this.timePicker) {
            this.setStartDate(this.startDate);
            this.renderTimePicker(SideEnum.left);
        }
        if (this.endDate && this.timePicker) {
            this.setEndDate(this.endDate);
            this.renderTimePicker(SideEnum.right);
        }
        this.updateMonthsInView();
        this.renderCalendar(SideEnum.left);
        this.renderCalendar(SideEnum.right);
        this.renderRanges();
    }
    renderRanges() {
        this.rangesArray = [];
        let start;
        let end;
        if (typeof this.ranges === 'object') {
            for (const range in this.ranges) {
                if (this.ranges[range]) {
                    if (typeof this.ranges[range][0] === 'string') {
                        start = dayjs(this.ranges[range][0], this.locale.format).utc(true);
                    }
                    else {
                        start = dayjs(this.ranges[range][0]).utc(true);
                    }
                    if (typeof this.ranges[range][1] === 'string') {
                        end = dayjs(this.ranges[range][1], this.locale.format).utc(true);
                    }
                    else {
                        end = dayjs(this.ranges[range][1]).utc(true);
                    }
                    if (this.minDate && start.isBefore(this.minDate)) {
                        start = this.minDate.clone();
                    }
                    let maxDate = this.maxDate;
                    if (this.maxSpan && maxDate && start.clone().add(this.maxSpan).isAfter(maxDate)) {
                        maxDate = start.clone().add(this.maxSpan);
                    }
                    if (maxDate && end.isAfter(maxDate)) {
                        end = maxDate.clone();
                    }
                    if ((this.minDate && end.isBefore(this.minDate, this.timePicker ? 'minute' : 'day')) ||
                        (maxDate && start.isAfter(maxDate, this.timePicker ? 'minute' : 'day'))) {
                        continue;
                    }
                    const elem = document.createElement('textarea');
                    elem.innerHTML = range;
                    const rangeHtml = elem.value;
                    this.ranges[rangeHtml] = [start, end];
                }
            }
            for (const range in this.ranges) {
                if (this.ranges[range]) {
                    this.rangesArray.push(range);
                }
            }
            if (this.showCustomRangeLabel) {
                this.rangesArray.push(this.locale.customRangeLabel);
            }
            this.showCalInRanges = !this.rangesArray.length || this.alwaysShowCalendars;
            if (!this.timePicker) {
                this.startDate = this.startDate.startOf('day');
                this.endDate = this.endDate.endOf('day');
            }
        }
    }
    renderTimePicker(side) {
        let selected;
        let minDate;
        const maxDate = this.maxDate;
        if (side === SideEnum.left) {
            selected = this.startDate.clone();
            minDate = this.minDate;
        }
        else if (side === SideEnum.right && this.endDate) {
            selected = this.endDate.clone();
            minDate = this.startDate;
        }
        else if (side === SideEnum.right && !this.endDate) {
            selected = this.getDateWithTime(this.startDate, SideEnum.right);
            if (selected.isBefore(this.startDate)) {
                selected = this.startDate.clone();
            }
            minDate = this.startDate;
        }
        const start = this.timePicker24Hour ? 0 : 1;
        const end = this.timePicker24Hour ? 23 : 12;
        this.timepickerVariables[side] = {
            hours: [],
            minutes: [],
            minutesLabel: [],
            seconds: [],
            secondsLabel: [],
            disabledHours: [],
            disabledMinutes: [],
            disabledSeconds: [],
            selectedHour: 0,
            selectedMinute: 0,
            selectedSecond: 0,
            selected
        };
        for (let i = start; i <= end; i++) {
            let iIn24 = i;
            if (!this.timePicker24Hour) {
                iIn24 = selected.hour() >= 12 ? (i === 12 ? 12 : i + 12) : i === 12 ? 0 : i;
            }
            const time = selected.clone().hour(iIn24);
            let disabled = false;
            if (minDate && time.minute(59).isBefore(minDate)) {
                disabled = true;
            }
            if (maxDate && time.minute(0).isAfter(maxDate)) {
                disabled = true;
            }
            this.timepickerVariables[side].hours.push(i);
            if (iIn24 === selected.hour() && !disabled) {
                this.timepickerVariables[side].selectedHour = i;
            }
            else if (disabled) {
                this.timepickerVariables[side].disabledHours.push(i);
            }
        }
        for (let i = 0; i < 60; i += this.timePickerIncrement) {
            const padded = i < 10 ? `0${i}` : `${i}`;
            const time = selected.clone().minute(i);
            let disabled = false;
            if (minDate && time.second(59).isBefore(minDate)) {
                disabled = true;
            }
            if (maxDate && time.second(0).isAfter(maxDate)) {
                disabled = true;
            }
            this.timepickerVariables[side].minutes.push(i);
            this.timepickerVariables[side].minutesLabel.push(padded);
            if (selected.minute() === i && !disabled) {
                this.timepickerVariables[side].selectedMinute = i;
            }
            else if (disabled) {
                this.timepickerVariables[side].disabledMinutes.push(i);
            }
        }
        if (this.timePickerSeconds) {
            for (let i = 0; i < 60; i++) {
                const padded = i < 10 ? `0${i}` : `${i}`;
                const time = selected.clone().second(i);
                let disabled = false;
                if (minDate && time.isBefore(minDate)) {
                    disabled = true;
                }
                if (maxDate && time.isAfter(maxDate)) {
                    disabled = true;
                }
                this.timepickerVariables[side].seconds.push(i);
                this.timepickerVariables[side].secondsLabel.push(padded);
                if (selected.second() === i && !disabled) {
                    this.timepickerVariables[side].selectedSecond = i;
                }
                else if (disabled) {
                    this.timepickerVariables[side].disabledSeconds.push(i);
                }
            }
        }
        if (!this.timePicker24Hour) {
            if (minDate && selected.clone().hour(12).minute(0).second(0).isBefore(minDate)) {
                this.timepickerVariables[side].amDisabled = true;
            }
            if (maxDate && selected.clone().hour(0).minute(0).second(0).isAfter(maxDate)) {
                this.timepickerVariables[side].pmDisabled = true;
            }
            if (selected.hour() >= 12) {
                this.timepickerVariables[side].ampmModel = 'PM';
            }
            else {
                this.timepickerVariables[side].ampmModel = 'AM';
            }
        }
        this.timepickerVariables[side].selected = selected;
    }
    renderCalendar(side) {
        const mainCalendar = side === SideEnum.left ? this.leftCalendar : this.rightCalendar;
        const month = mainCalendar.month.month();
        const year = mainCalendar.month.year();
        const hour = mainCalendar.month.hour();
        const minute = mainCalendar.month.minute();
        const second = mainCalendar.month.second();
        const daysInMonth = dayjs(new Date(year, month)).utc(true).daysInMonth();
        const firstDay = dayjs(new Date(year, month, 1)).utc(true);
        const lastDay = dayjs(new Date(year, month, daysInMonth)).utc(true);
        const lastMonth = dayjs(firstDay).utc(true).subtract(1, 'month').month();
        const lastYear = dayjs(firstDay).utc(true).subtract(1, 'month').year();
        const daysInLastMonth = dayjs(new Date(lastYear, lastMonth)).utc(true).daysInMonth();
        const dayOfWeek = firstDay.day();
        const calendar = [];
        calendar.firstDay = firstDay;
        calendar.lastDay = lastDay;
        for (let i = 0; i < 6; i++) {
            calendar[i] = [];
        }
        let startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
        if (startDay > daysInLastMonth) {
            startDay -= 7;
        }
        if (dayOfWeek === this.locale.firstDay) {
            startDay = daysInLastMonth - 6;
        }
        let curDate = dayjs(new Date(lastYear, lastMonth, startDay, 12, minute, second)).utc(true);
        for (let i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = dayjs(curDate).utc(true).add(24, 'hours')) {
            if (i > 0 && col % 7 === 0) {
                col = 0;
                row++;
            }
            calendar[row][col] = curDate.clone().hour(hour).minute(minute).second(second);
            curDate = curDate.hour(12);
            if (this.minDate &&
                calendar[row][col].format('YYYY-MM-DD') === this.minDate.format('YYYY-MM-DD') &&
                calendar[row][col].isBefore(this.minDate) &&
                side === 'left') {
                calendar[row][col] = this.minDate.clone();
            }
            if (this.maxDate &&
                calendar[row][col].format('YYYY-MM-DD') === this.maxDate.format('YYYY-MM-DD') &&
                calendar[row][col].isAfter(this.maxDate) &&
                side === 'right') {
                calendar[row][col] = this.maxDate.clone();
            }
        }
        if (side === SideEnum.left) {
            this.leftCalendar.calendar = calendar;
        }
        else {
            this.rightCalendar.calendar = calendar;
        }
        let minDate = side === 'left' ? this.minDate : this.startDate;
        let maxDate = this.maxDate;
        if (this.endDate === null && this.dateLimit) {
            const maxLimit = this.startDate.clone().add(this.dateLimit, 'day').endOf('day');
            if (!maxDate || maxLimit.isBefore(maxDate)) {
                maxDate = maxLimit;
            }
            if (this.customRangeDirection) {
                minDate = this.minDate;
                const minLimit = this.startDate.clone().subtract(this.dateLimit, 'day').endOf('day');
                if (!minDate || minLimit.isAfter(minDate)) {
                    minDate = minLimit;
                }
            }
        }
        this.calendarVariables[side] = {
            month,
            year,
            hour,
            minute,
            second,
            daysInMonth,
            firstDay,
            lastDay,
            lastMonth,
            lastYear,
            daysInLastMonth,
            dayOfWeek,
            calRows: Array.from(Array(6).keys()),
            calCols: Array.from(Array(7).keys()),
            classes: {},
            minDate,
            maxDate,
            calendar
        };
        if (this.showDropdowns) {
            const currentMonth = calendar[1][1].month();
            const currentYear = calendar[1][1].year();
            const realCurrentYear = dayjs().utc(true).year();
            const maxYear = (maxDate && maxDate.year()) || realCurrentYear + 5;
            const minYear = (minDate && minDate.year()) || realCurrentYear - 50;
            const inMinYear = currentYear === minYear;
            const inMaxYear = currentYear === maxYear;
            const years = [];
            for (let y = minYear; y <= maxYear; y++) {
                years.push(y);
            }
            this.calendarVariables[side].dropdowns = {
                currentMonth,
                currentYear,
                maxYear,
                minYear,
                inMinYear,
                inMaxYear,
                monthArrays: Array.from(Array(12).keys()),
                yearArrays: years
            };
        }
        this.buildCells(calendar, side);
    }
    setStartDate(startDate) {
        if (typeof startDate === 'string') {
            this.startDate = dayjs(startDate, this.locale.format).utc(true);
        }
        if (typeof startDate === 'object') {
            this.pickingDate = true;
            this.startDate = dayjs(startDate).utc(true);
        }
        if (!this.timePicker) {
            this.pickingDate = true;
            this.startDate = this.startDate.startOf('day');
        }
        if (this.timePicker && this.timePickerIncrement) {
            this.startDate = this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
        }
        if (this.minDate && this.startDate.isBefore(this.minDate)) {
            this.startDate = this.minDate.clone();
            if (this.timePicker && this.timePickerIncrement) {
                this.startDate = this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
            }
        }
        if (this.maxDate && this.startDate.isAfter(this.maxDate)) {
            this.startDate = this.maxDate.clone();
            if (this.timePicker && this.timePickerIncrement) {
                this.startDate = this.startDate.minute(Math.floor(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
            }
        }
        if (!this.isShown) {
            this.updateElement();
        }
        this.startDateChanged.emit({ startDate: this.startDate });
        this.updateMonthsInView();
    }
    setEndDate(endDate) {
        if (typeof endDate === 'string') {
            this.endDate = dayjs(endDate, this.locale.format).utc(true);
        }
        if (typeof endDate === 'object') {
            this.pickingDate = false;
            this.endDate = dayjs(endDate).utc(true);
        }
        if (!this.timePicker) {
            this.pickingDate = false;
            this.endDate = this.endDate.add(1, 'd').startOf('day').subtract(1, 'second');
        }
        if (this.timePicker && this.timePickerIncrement) {
            this.endDate.minute(Math.round(this.endDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
        }
        if (this.endDate.isBefore(this.startDate)) {
            this.endDate = this.startDate.clone();
        }
        if (this.maxDate && this.endDate.isAfter(this.maxDate)) {
            this.endDate = this.maxDate.clone();
        }
        if (this.dateLimit && this.startDate.clone().add(this.dateLimit, 'day').isBefore(this.endDate)) {
            this.endDate = this.startDate.clone().add(this.dateLimit, 'day');
        }
        if (!this.isShown) {
        }
        this.endDateChanged.emit({ endDate: this.endDate });
        this.updateMonthsInView();
    }
    updateView() {
        if (this.timePicker) {
            this.renderTimePicker(SideEnum.left);
            this.renderTimePicker(SideEnum.right);
        }
        this.updateMonthsInView();
        this.updateCalendars();
    }
    updateMonthsInView() {
        if (this.endDate) {
            if (!this.singleDatePicker &&
                this.leftCalendar.month &&
                this.rightCalendar.month &&
                ((this.startDate && this.leftCalendar && this.startDate.format('YYYY-MM') === this.leftCalendar.month.format('YYYY-MM')) ||
                    (this.startDate && this.rightCalendar && this.startDate.format('YYYY-MM') === this.rightCalendar.month.format('YYYY-MM'))) &&
                (this.endDate.format('YYYY-MM') === this.leftCalendar.month.format('YYYY-MM') ||
                    this.endDate.format('YYYY-MM') === this.rightCalendar.month.format('YYYY-MM'))) {
                return;
            }
            if (this.startDate) {
                this.leftCalendar.month = this.startDate.clone().date(2);
                if (!this.linkedCalendars && (this.endDate.month() !== this.startDate.month() || this.endDate.year() !== this.startDate.year())) {
                    this.rightCalendar.month = this.endDate.clone().date(2);
                }
                else {
                    this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
                }
            }
        }
        else {
            if (this.leftCalendar.month.format('YYYY-MM') !== this.startDate.format('YYYY-MM') &&
                this.rightCalendar.month.format('YYYY-MM') !== this.startDate.format('YYYY-MM')) {
                this.leftCalendar.month = this.startDate.clone().date(2);
                this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
            }
        }
        if (this.maxDate && this.linkedCalendars && !this.singleDatePicker && this.rightCalendar.month > this.maxDate) {
            this.rightCalendar.month = this.maxDate.clone().date(2);
            this.leftCalendar.month = this.maxDate.clone().date(2).subtract(1, 'month');
        }
    }
    updateCalendars() {
        this.renderCalendar(SideEnum.left);
        this.renderCalendar(SideEnum.right);
        if (this.endDate === null) {
            return;
        }
        this.calculateChosenLabel();
    }
    updateElement() {
        const format = this.locale.displayFormat ? this.locale.displayFormat : this.locale.format;
        if (!this.singleDatePicker && this.autoUpdateInput) {
            if (this.startDate && this.endDate) {
                if (this.rangesArray.length &&
                    this.showRangeLabelOnInput === true &&
                    this.chosenRange &&
                    this.locale.customRangeLabel !== this.chosenRange) {
                    this.chosenLabel = this.chosenRange;
                }
                else {
                    this.chosenLabel = this.startDate.format(format) + this.locale.separator + this.endDate.format(format);
                }
            }
        }
        else if (this.autoUpdateInput) {
            this.chosenLabel = this.startDate.format(format);
        }
    }
    remove() {
        this.isShown = false;
    }
    calculateChosenLabel() {
        if (!this.locale || !this.locale.separator) {
            this.buildLocale();
        }
        let customRange = true;
        let i = 0;
        if (this.rangesArray.length > 0) {
            for (const range in this.ranges) {
                if (this.ranges[range]) {
                    if (this.timePicker) {
                        const format = this.timePickerSeconds ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD HH:mm';
                        if (this.startDate.format(format) === this.ranges[range][0].format(format) &&
                            this.endDate.format(format) === this.ranges[range][1].format(format)) {
                            customRange = false;
                            this.chosenRange = this.rangesArray[i];
                            break;
                        }
                    }
                    else {
                        if (this.startDate.format('YYYY-MM-DD') === this.ranges[range][0].format('YYYY-MM-DD') &&
                            this.endDate.format('YYYY-MM-DD') === this.ranges[range][1].format('YYYY-MM-DD')) {
                            customRange = false;
                            this.chosenRange = this.rangesArray[i];
                            break;
                        }
                    }
                    i++;
                }
            }
            if (customRange) {
                if (this.showCustomRangeLabel) {
                    this.chosenRange = this.locale.customRangeLabel;
                }
                else {
                    this.chosenRange = null;
                }
                this.showCalInRanges = true;
            }
        }
        this.updateElement();
    }
    clickApply(e) {
        if (!this.singleDatePicker && this.startDate && !this.endDate) {
            this.endDate = this.getDateWithTime(this.startDate, SideEnum.right);
            this.calculateChosenLabel();
        }
        if (this.isInvalidDate && this.startDate && this.endDate) {
            let d = this.startDate.clone();
            while (d.isBefore(this.endDate)) {
                if (this.isInvalidDate(d)) {
                    this.endDate = d.subtract(1, 'days');
                    this.calculateChosenLabel();
                    break;
                }
                d = d.add(1, 'days');
            }
        }
        if (this.chosenLabel) {
            this.choosedDate.emit({ chosenLabel: this.chosenLabel, startDate: this.startDate, endDate: this.endDate });
        }
        this.datesUpdated.emit({ startDate: this.startDate, endDate: this.endDate });
        if (e || (this.closeOnAutoApply && !e)) {
            this.hide();
        }
    }
    clickCancel(e) {
        this.startDate = this.cachedVersion.start;
        this.endDate = this.cachedVersion.end;
        if (this.inline) {
            this.updateView();
        }
        this.cancelClicked.emit();
        this.hide();
    }
    monthChanged(monthEvent, side) {
        const year = this.calendarVariables[side].dropdowns.currentYear;
        const month = parseInt(monthEvent.target.value, 10);
        this.monthOrYearChanged(month, year, side);
    }
    yearChanged(yearEvent, side) {
        const month = this.calendarVariables[side].dropdowns.currentMonth;
        const year = parseInt(yearEvent.target.value, 10);
        this.monthOrYearChanged(month, year, side);
    }
    timeChanged(timeEvent, side) {
        let hour = parseInt(String(this.timepickerVariables[side].selectedHour), 10);
        const minute = parseInt(String(this.timepickerVariables[side].selectedMinute), 10);
        const second = this.timePickerSeconds ? parseInt(String(this.timepickerVariables[side].selectedSecond), 10) : 0;
        if (!this.timePicker24Hour) {
            const ampm = this.timepickerVariables[side].ampmModel;
            if (ampm === 'PM' && hour < 12) {
                hour += 12;
            }
            if (ampm === 'AM' && hour === 12) {
                hour = 0;
            }
        }
        if (side === SideEnum.left) {
            let start = this.startDate.clone();
            start = start.hour(hour);
            start = start.minute(minute);
            start = start.second(second);
            this.setStartDate(start);
            if (this.singleDatePicker) {
                this.endDate = this.startDate.clone();
            }
            else if (this.endDate && this.endDate.format('YYYY-MM-DD') === start.format('YYYY-MM-DD') && this.endDate.isBefore(start)) {
                this.setEndDate(start.clone());
            }
            else if (!this.endDate && this.timePicker) {
                const startClone = this.getDateWithTime(start, SideEnum.right);
                if (startClone.isBefore(start)) {
                    this.timepickerVariables[SideEnum.right].selectedHour = hour;
                    this.timepickerVariables[SideEnum.right].selectedMinute = minute;
                    this.timepickerVariables[SideEnum.right].selectedSecond = second;
                }
            }
        }
        else if (this.endDate) {
            let end = this.endDate.clone();
            end = end.hour(hour);
            end = end.minute(minute);
            end = end.second(second);
            this.setEndDate(end);
        }
        this.updateCalendars();
        this.renderTimePicker(SideEnum.left);
        this.renderTimePicker(SideEnum.right);
        if (this.autoApply) {
            this.clickApply();
        }
    }
    monthOrYearChanged(month, year, side) {
        const isLeft = side === SideEnum.left;
        let newMonth = month;
        let newYear = year;
        if (!isLeft) {
            if (newYear < this.startDate.year() || (newYear === this.startDate.year() && newMonth < this.startDate.month())) {
                newMonth = this.startDate.month();
                newYear = this.startDate.year();
            }
        }
        if (this.minDate) {
            if (newYear < this.minDate.year() || (newYear === this.minDate.year() && newMonth < this.minDate.month())) {
                newMonth = this.minDate.month();
                newYear = this.minDate.year();
            }
        }
        if (this.maxDate) {
            if (newYear > this.maxDate.year() || (newYear === this.maxDate.year() && newMonth > this.maxDate.month())) {
                newMonth = this.maxDate.month();
                newYear = this.maxDate.year();
            }
        }
        this.calendarVariables[side].dropdowns.currentYear = newYear;
        this.calendarVariables[side].dropdowns.currentMonth = newMonth;
        if (isLeft) {
            this.leftCalendar.month = this.leftCalendar.month.month(newMonth).year(newYear);
            if (this.linkedCalendars) {
                this.rightCalendar.month = this.leftCalendar.month.clone().add(1, 'month');
            }
        }
        else {
            this.rightCalendar.month = this.rightCalendar.month.month(newMonth).year(newYear);
            if (this.linkedCalendars) {
                this.leftCalendar.month = this.rightCalendar.month.clone().subtract(1, 'month');
            }
        }
        this.updateCalendars();
    }
    clickPrev(side) {
        if (side === SideEnum.left) {
            this.leftCalendar.month = this.leftCalendar.month.subtract(1, 'month');
            if (this.linkedCalendars) {
                this.rightCalendar.month = this.rightCalendar.month.subtract(1, 'month');
            }
        }
        else {
            this.rightCalendar.month = this.rightCalendar.month.subtract(1, 'month');
        }
        this.updateCalendars();
    }
    hoverDate(e, side, row, col) {
        const leftCalDate = this.calendarVariables.left.calendar[row][col];
        const rightCalDate = this.calendarVariables.right.calendar[row][col];
        if (this.pickingDate) {
            this.nowHoveredDate = side === SideEnum.left ? leftCalDate : rightCalDate;
            this.renderCalendar(SideEnum.left);
            this.renderCalendar(SideEnum.right);
        }
    }
    clickDate(e, side, row, col) {
        if (e.target.tagName === 'TD') {
            if (!e.target.classList.contains('available')) {
                return;
            }
        }
        else if (e.target.tagName === 'SPAN') {
            if (!e.target.parentElement.classList.contains('available')) {
                return;
            }
        }
        if (this.rangesArray.length) {
            this.chosenRange = this.locale.customRangeLabel;
        }
        let date = side === SideEnum.left ? this.leftCalendar.calendar[row][col] : this.rightCalendar.calendar[row][col];
        if ((this.endDate || (date.isBefore(this.startDate, 'day') && this.customRangeDirection === false)) && this.lockStartDate === false) {
            if (this.timePicker) {
                date = this.getDateWithTime(date, SideEnum.left);
            }
            this.endDate = null;
            this.setStartDate(date.clone());
        }
        else if (!this.endDate && date.isBefore(this.startDate) && this.customRangeDirection === false) {
            this.setEndDate(this.startDate.clone());
        }
        else {
            if (this.timePicker) {
                date = this.getDateWithTime(date, SideEnum.right);
            }
            if (date.isBefore(this.startDate, 'day') === true && this.customRangeDirection === true) {
                this.setEndDate(this.startDate);
                this.setStartDate(date.clone());
            }
            else {
                this.setEndDate(date.clone());
            }
            if (this.autoApply) {
                this.calculateChosenLabel();
            }
        }
        if (this.singleDatePicker) {
            this.setEndDate(this.startDate);
            this.updateElement();
            if (this.autoApply) {
                this.clickApply();
            }
        }
        this.updateView();
        if (this.autoApply && this.startDate && this.endDate) {
            this.clickApply();
        }
        e.stopPropagation();
    }
    clickRange(e, label) {
        this.chosenRange = label;
        if (label === this.locale.customRangeLabel) {
            this.isShown = true;
            this.showCalInRanges = true;
        }
        else {
            const dates = this.ranges[label];
            console.log('1 ', dates);
            this.startDate = dates[0].clone();
            this.endDate = dates[1].clone();
            if (this.showRangeLabelOnInput && label !== this.locale.customRangeLabel) {
                this.chosenLabel = label;
            }
            else {
                this.calculateChosenLabel();
            }
            this.showCalInRanges = !this.rangesArray.length || this.alwaysShowCalendars;
            if (!this.timePicker) {
                this.startDate = this.startDate.startOf('day');
                this.endDate = this.endDate.endOf('day');
            }
            if (!this.alwaysShowCalendars) {
                this.isShown = false;
            }
            this.rangeClicked.emit({ label, dates });
            if (!this.keepCalendarOpeningWithRange || this.autoApply) {
                this.clickApply();
            }
            else {
                if (!this.alwaysShowCalendars) {
                    return this.clickApply();
                }
                if (this.maxDate && this.maxDate.isSame(dates[0], 'month')) {
                    this.rightCalendar.month = this.rightCalendar.month.month(dates[0].month());
                    this.rightCalendar.month = this.rightCalendar.month.year(dates[0].year());
                    this.leftCalendar.month = this.leftCalendar.month.month(dates[0].month() - 1);
                    this.leftCalendar.month = this.leftCalendar.month.year(dates[1].year());
                }
                else {
                    this.leftCalendar.month = this.leftCalendar.month.month(dates[0].month());
                    this.leftCalendar.month = this.leftCalendar.month.year(dates[0].year());
                    const nextMonth = !this.linkedCalendars ? dates[1].clone() : dates[0].clone().add(1, 'month');
                    this.rightCalendar.month = this.rightCalendar.month.month(nextMonth.month());
                    this.rightCalendar.month = this.rightCalendar.month.year(nextMonth.year());
                }
                this.updateCalendars();
                if (this.timePicker) {
                    this.renderTimePicker(SideEnum.left);
                    this.renderTimePicker(SideEnum.right);
                }
            }
        }
    }
    show(e) {
        if (this.isShown) {
            return;
        }
        this.cachedVersion.start = this.startDate.clone();
        this.cachedVersion.end = this.endDate.clone();
        this.isShown = true;
        this.updateView();
    }
    hide(e) {
        if (!this.isShown) {
            return;
        }
        if (!this.endDate) {
            if (this.cachedVersion.start) {
                this.startDate = this.cachedVersion.start.clone();
            }
            if (this.cachedVersion.end) {
                this.endDate = this.cachedVersion.end.clone();
            }
        }
        if (!this.startDate.isSame(this.cachedVersion.start) || !this.endDate.isSame(this.cachedVersion.end)) {
        }
        this.updateElement();
        this.isShown = false;
        this.ref.detectChanges();
    }
    updateLocale(locale) {
        for (const key in locale) {
            if (Object.prototype.hasOwnProperty.call(locale, key)) {
                this.locale[key] = locale[key];
                if (key === 'customRangeLabel') {
                    this.renderRanges();
                }
            }
        }
    }
    clear() {
        this.startDate = dayjs().utc(true).startOf('day');
        this.endDate = dayjs().utc(true).endOf('day');
        this.choosedDate.emit({ chosenLabel: '', startDate: null, endDate: null });
        this.datesUpdated.emit({ startDate: null, endDate: null });
        this.clearClicked.emit();
        this.hide();
    }
    disableRange(range) {
        if (range === this.locale.customRangeLabel) {
            return false;
        }
        const rangeMarkers = this.ranges[range];
        const areBothBefore = rangeMarkers.every((date) => {
            if (!this.minDate) {
                return false;
            }
            return date.isBefore(this.minDate);
        });
        const areBothAfter = rangeMarkers.every((date) => {
            if (!this.maxDate) {
                return false;
            }
            return date.isAfter(this.maxDate);
        });
        return areBothBefore || areBothAfter;
    }
    getDateWithTime(date, side) {
        let hour = parseInt(String(this.timepickerVariables[side].selectedHour), 10);
        if (!this.timePicker24Hour) {
            const ampm = this.timepickerVariables[side].ampmModel;
            if (ampm === 'PM' && hour < 12) {
                hour += 12;
            }
            if (ampm === 'AM' && hour === 12) {
                hour = 0;
            }
        }
        const minute = parseInt(String(this.timepickerVariables[side].selectedMinute), 10);
        const second = this.timePickerSeconds ? parseInt(String(this.timepickerVariables[side].selectedSecond), 10) : 0;
        return date.clone().hour(hour).minute(minute).second(second);
    }
    buildLocale() {
        this.locale = { ...this.localeHolderService.config, ...this.locale };
        if (!this.locale.format) {
            if (this.timePicker) {
                this.locale.format = dayjs.localeData().longDateFormat('lll');
            }
            else {
                this.locale.format = dayjs.localeData().longDateFormat('L');
            }
        }
    }
    buildCells(calendar, side) {
        for (let row = 0; row < 6; row++) {
            this.calendarVariables[side].classes[row] = { classList: '' };
            const rowClasses = [];
            if (this.emptyWeekRowClass &&
                Array.from(Array(7).keys()).some((i) => calendar[row][i].month() !== this.calendarVariables[side].month)) {
                rowClasses.push(this.emptyWeekRowClass);
            }
            for (let col = 0; col < 7; col++) {
                const classes = [];
                if (this.emptyWeekColumnClass) {
                    if (calendar[row][col].month() !== this.calendarVariables[side].month) {
                        classes.push(this.emptyWeekColumnClass);
                    }
                }
                if (calendar[row][col].isSame(dayjs().utc(true), 'day')) {
                    classes.push('today');
                }
                if (calendar[row][col].isoWeekday() > 5) {
                    classes.push('weekend');
                }
                if (calendar[row][col].month() !== calendar[1][1].month()) {
                    classes.push('off');
                    if (this.lastDayOfPreviousMonthClass &&
                        (calendar[row][col].month() < calendar[1][1].month() || calendar[1][1].month() === 0) &&
                        calendar[row][col].date() === this.calendarVariables[side].daysInLastMonth) {
                        classes.push(this.lastDayOfPreviousMonthClass);
                    }
                    if (this.firstDayOfNextMonthClass &&
                        (calendar[row][col].month() > calendar[1][1].month() || calendar[row][col].month() === 0) &&
                        calendar[row][col].date() === 1) {
                        classes.push(this.firstDayOfNextMonthClass);
                    }
                }
                if (this.firstMonthDayClass &&
                    calendar[row][col].month() === calendar[1][1].month() &&
                    calendar[row][col].date() === calendar.firstDay.date()) {
                    classes.push(this.firstMonthDayClass);
                }
                if (this.lastMonthDayClass &&
                    calendar[row][col].month() === calendar[1][1].month() &&
                    calendar[row][col].date() === calendar.lastDay.date()) {
                    classes.push(this.lastMonthDayClass);
                }
                if (this.minDate && calendar[row][col].isBefore(this.minDate, 'day')) {
                    classes.push('off', 'disabled');
                }
                if (this.calendarVariables[side].maxDate && calendar[row][col].isAfter(this.calendarVariables[side].maxDate, 'day')) {
                    classes.push('off', 'disabled');
                }
                if (this.isInvalidDate(calendar[row][col])) {
                    classes.push('off', 'disabled', 'invalid');
                }
                if (this.startDate && calendar[row][col].format('YYYY-MM-DD') === this.startDate.format('YYYY-MM-DD')) {
                    classes.push('active', 'start-date');
                }
                if (this.endDate != null && calendar[row][col].format('YYYY-MM-DD') === this.endDate.format('YYYY-MM-DD')) {
                    classes.push('active', 'end-date');
                }
                if (((this.nowHoveredDate != null && this.pickingDate) || this.endDate != null) &&
                    calendar[row][col] > this.startDate &&
                    (calendar[row][col] < this.endDate || (calendar[row][col] < this.nowHoveredDate && this.pickingDate)) &&
                    !classes.find((el) => el === 'off')) {
                    classes.push('in-range');
                }
                const isCustom = this.isCustomDate(calendar[row][col]);
                if (isCustom !== false) {
                    if (typeof isCustom === 'string') {
                        classes.push(isCustom);
                    }
                    else {
                        Array.prototype.push.apply(classes, isCustom);
                    }
                }
                let cname = '';
                let disabled = false;
                for (const className of classes) {
                    cname += className + ' ';
                    if (className === 'disabled') {
                        disabled = true;
                    }
                }
                if (!disabled) {
                    cname += 'available';
                }
                this.calendarVariables[side].classes[row][col] = cname.replace(/^\s+|\s+$/g, '');
            }
            this.calendarVariables[side].classes[row].classList = rowClasses.join(' ');
        }
    }
}
DaterangepickerComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: DaterangepickerComponent, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: LocaleService }], target: i0.ɵɵFactoryTarget.Component });
DaterangepickerComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.3.11", type: DaterangepickerComponent, selector: "ngx-daterangepicker-material", inputs: { startDate: "startDate", endDate: "endDate", dateLimit: "dateLimit", autoApply: "autoApply", singleDatePicker: "singleDatePicker", showDropdowns: "showDropdowns", showWeekNumbers: "showWeekNumbers", showISOWeekNumbers: "showISOWeekNumbers", linkedCalendars: "linkedCalendars", autoUpdateInput: "autoUpdateInput", alwaysShowCalendars: "alwaysShowCalendars", maxSpan: "maxSpan", lockStartDate: "lockStartDate", timePicker: "timePicker", timePicker24Hour: "timePicker24Hour", timePickerIncrement: "timePickerIncrement", timePickerSeconds: "timePickerSeconds", showClearButton: "showClearButton", firstMonthDayClass: "firstMonthDayClass", lastMonthDayClass: "lastMonthDayClass", emptyWeekRowClass: "emptyWeekRowClass", emptyWeekColumnClass: "emptyWeekColumnClass", firstDayOfNextMonthClass: "firstDayOfNextMonthClass", lastDayOfPreviousMonthClass: "lastDayOfPreviousMonthClass", showCustomRangeLabel: "showCustomRangeLabel", showCancel: "showCancel", keepCalendarOpeningWithRange: "keepCalendarOpeningWithRange", showRangeLabelOnInput: "showRangeLabelOnInput", customRangeDirection: "customRangeDirection", drops: "drops", opens: "opens", closeOnAutoApply: "closeOnAutoApply", minDate: "minDate", locale: "locale", ranges: "ranges", maxDate: "maxDate", isInvalidDate: "isInvalidDate", isCustomDate: "isCustomDate", isTooltipDate: "isTooltipDate" }, outputs: { choosedDate: "choosedDate", rangeClicked: "rangeClicked", datesUpdated: "datesUpdated", startDateChanged: "startDateChanged", endDateChanged: "endDateChanged", cancelClicked: "cancelClicked", clearClicked: "clearClicked" }, host: { listeners: { "click": "handleInternalClick($event)" } }, providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DaterangepickerComponent),
            multi: true
        }
    ], viewQueries: [{ propertyName: "pickerContainer", first: true, predicate: ["pickerContainer"], descendants: true, static: true }], usesOnChanges: true, ngImport: i0, template: "<div\n    class=\"md-drppicker\"\n    #pickerContainer\n    [ngClass]=\"{\n        ltr: locale.direction === 'ltr',\n        rtl: this.locale.direction === 'rtl',\n        shown: isShown || inline,\n        hidden: !isShown && !inline,\n        inline: inline,\n        double: !singleDatePicker && showCalInRanges,\n        'show-ranges': rangesArray.length\n    }\"\n    [class]=\"'drops-' + drops + '-' + opens\">\n    <ng-container *ngIf=\"rangesArray.length\">\n        <div class=\"ranges\">\n            <ul>\n                <li *ngFor=\"let range of rangesArray\">\n                    <button\n                        type=\"button\"\n                        (click)=\"clickRange($event, range)\"\n                        [disabled]=\"disableRange(range)\"\n                        [ngClass]=\"{ active: range === chosenRange }\">\n                        {{ range }}\n                    </button>\n                </li>\n            </ul>\n        </div>\n    </ng-container>\n    <div class=\"calendar\" [ngClass]=\"{ right: singleDatePicker, left: !singleDatePicker }\" *ngIf=\"showCalInRanges\">\n        <div class=\"calendar-table\">\n            <table class=\"table-condensed\" *ngIf=\"calendarVariables\">\n                <thead>\n                    <tr>\n                        <th *ngIf=\"showWeekNumbers || showISOWeekNumbers\"></th>\n                        <ng-container\n                            *ngIf=\"\n                                !calendarVariables.left.minDate ||\n                                (calendarVariables.left.minDate.isBefore(calendarVariables.left.calendar.firstDay) &&\n                                    (!this.linkedCalendars || true))\n                            \">\n                            <th (click)=\"clickPrev(sideEnum.left)\" class=\"prev available\"></th>\n                        </ng-container>\n                        <ng-container\n                            *ngIf=\"\n                                !(\n                                    !calendarVariables.left.minDate ||\n                                    (calendarVariables.left.minDate.isBefore(calendarVariables.left.calendar.firstDay) &&\n                                        (!this.linkedCalendars || true))\n                                )\n                            \">\n                            <th></th>\n                        </ng-container>\n                        <th colspan=\"5\" class=\"month drp-animate\">\n                            <ng-container *ngIf=\"showDropdowns && calendarVariables.left.dropdowns\">\n                                <div class=\"dropdowns\">\n                                    {{ this.locale.monthNames[calendarVariables?.left?.calendar[1][1].month()] }}\n                                    <select class=\"monthselect\" (change)=\"monthChanged($event, sideEnum.left)\">\n                                        <option\n                                            [disabled]=\"\n                                                (calendarVariables.left.dropdowns.inMinYear &&\n                                                    m < calendarVariables.left.minDate.month()) ||\n                                                (calendarVariables.left.dropdowns.inMaxYear && m > calendarVariables.left.maxDate.month())\n                                            \"\n                                            *ngFor=\"let m of calendarVariables.left.dropdowns.monthArrays\"\n                                            [value]=\"m\"\n                                            [selected]=\"calendarVariables.left.dropdowns.currentMonth === m\">\n                                            {{ locale.monthNames[m] }}\n                                        </option>\n                                    </select>\n                                </div>\n                                <div class=\"dropdowns\">\n                                    {{ calendarVariables?.left?.calendar[1][1].format(' YYYY') }}\n                                    <select class=\"yearselect\" (change)=\"yearChanged($event, sideEnum.left)\">\n                                        <option\n                                            *ngFor=\"let y of calendarVariables.left.dropdowns.yearArrays\"\n                                            [selected]=\"y === calendarVariables.left.dropdowns.currentYear\">\n                                            {{ y }}\n                                        </option>\n                                    </select>\n                                </div>\n                            </ng-container>\n                            <ng-container *ngIf=\"!showDropdowns || !calendarVariables.left.dropdowns\">\n                                {{ this.locale.monthNames[calendarVariables?.left?.calendar[1][1].month()] }}\n                                {{ calendarVariables?.left?.calendar[1][1].format(' YYYY') }}\n                            </ng-container>\n                        </th>\n                        <ng-container\n                            *ngIf=\"\n                                (!calendarVariables.left.maxDate ||\n                                    calendarVariables.left.maxDate.isAfter(calendarVariables.left.calendar.lastDay)) &&\n                                (!linkedCalendars || singleDatePicker)\n                            \">\n                            <th class=\"next available\" (click)=\"clickNext(sideEnum.left)\"></th>\n                        </ng-container>\n                        <ng-container\n                            *ngIf=\"\n                                !(\n                                    (!calendarVariables.left.maxDate ||\n                                        calendarVariables.left.maxDate.isAfter(calendarVariables.left.calendar.lastDay)) &&\n                                    (!linkedCalendars || singleDatePicker)\n                                )\n                            \">\n                            <th></th>\n                        </ng-container>\n                    </tr>\n                    <tr class=\"week-days\">\n                        <th *ngIf=\"showWeekNumbers || showISOWeekNumbers\" class=\"week\">\n                            <span>{{ this.locale.weekLabel }}</span>\n                        </th>\n                        <th *ngFor=\"let dayofweek of locale.daysOfWeek\">\n                            <span>{{ dayofweek }}</span>\n                        </th>\n                    </tr>\n                </thead>\n                <tbody class=\"drp-animate\">\n                    <tr *ngFor=\"let row of calendarVariables.left.calRows\" [class]=\"calendarVariables.left.classes[row].classList\">\n                        <!-- add week number -->\n                        <td class=\"week\" *ngIf=\"showWeekNumbers\">\n                            <span>{{ calendarVariables.left.calendar[row][0].week() }}</span>\n                        </td>\n                        <td class=\"week\" *ngIf=\"showISOWeekNumbers\">\n                            <span>{{ calendarVariables.left.calendar[row][0].isoWeek() }}</span>\n                        </td>\n                        <!-- cal -->\n                        <td\n                            *ngFor=\"let col of calendarVariables.left.calCols\"\n                            [class]=\"calendarVariables.left.classes[row][col]\"\n                            (click)=\"clickDate($event, sideEnum.left, row, col)\"\n                            (mouseenter)=\"hoverDate($event, sideEnum.left, row, col)\">\n                            <span>{{ calendarVariables.left.calendar[row][col].date() }}</span>\n                        </td>\n                    </tr>\n                </tbody>\n            </table>\n        </div>\n        <div class=\"calendar-time\" *ngIf=\"timePicker\">\n            <div class=\"select\">\n                <select\n                    class=\"hourselect select-item\"\n                    [disabled]=\"!startDate\"\n                    [(ngModel)]=\"timepickerVariables.left.selectedHour\"\n                    (ngModelChange)=\"timeChanged($event, sideEnum.left)\">\n                    <option\n                        *ngFor=\"let i of timepickerVariables.left.hours\"\n                        [value]=\"i\"\n                        [disabled]=\"timepickerVariables.left.disabledHours.indexOf(i) > -1\">\n                        {{ i }}\n                    </option>\n                </select>\n            </div>\n            <div class=\"select\">\n                <select\n                    class=\"select-item minuteselect\"\n                    [disabled]=\"!startDate\"\n                    [(ngModel)]=\"timepickerVariables.left.selectedMinute\"\n                    (ngModelChange)=\"timeChanged($event, sideEnum.left)\">\n                    <option\n                        *ngFor=\"let i of timepickerVariables.left.minutes; let index = index\"\n                        [value]=\"i\"\n                        [disabled]=\"timepickerVariables.left.disabledMinutes.indexOf(i) > -1\">\n                        {{ timepickerVariables.left.minutesLabel[index] }}\n                    </option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n            <div class=\"select\">\n                <select\n                    class=\"select-item secondselect\"\n                    *ngIf=\"timePickerSeconds\"\n                    [disabled]=\"!startDate\"\n                    [(ngModel)]=\"timepickerVariables.left.selectedSecond\"\n                    (ngModelChange)=\"timeChanged($event, sideEnum.left)\">\n                    <option\n                        *ngFor=\"let i of timepickerVariables.left.seconds; let index = index\"\n                        [value]=\"i\"\n                        [disabled]=\"timepickerVariables.left.disabledSeconds.indexOf(i) > -1\">\n                        {{ timepickerVariables.left.secondsLabel[index] }}\n                    </option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n            <div class=\"select\">\n                <select\n                    class=\"select-item ampmselect\"\n                    *ngIf=\"!timePicker24Hour\"\n                    [(ngModel)]=\"timepickerVariables.left.ampmModel\"\n                    (ngModelChange)=\"timeChanged($event, sideEnum.left)\">\n                    <option value=\"AM\" [disabled]=\"timepickerVariables.left.amDisabled\">AM</option>\n                    <option value=\"PM\" [disabled]=\"timepickerVariables.left.pmDisabled\">PM</option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n        </div>\n    </div>\n    <div class=\"calendar right\" *ngIf=\"showCalInRanges && !singleDatePicker\">\n        <div class=\"calendar-table\">\n            <table class=\"table-condensed\" *ngIf=\"calendarVariables\">\n                <thead>\n                    <tr>\n                        <th *ngIf=\"showWeekNumbers || showISOWeekNumbers\"></th>\n                        <ng-container\n                            *ngIf=\"\n                                (!calendarVariables.right.minDate ||\n                                    calendarVariables.right.minDate.isBefore(calendarVariables.right.calendar.firstDay)) &&\n                                !this.linkedCalendars\n                            \">\n                            <th (click)=\"clickPrev(sideEnum.right)\" class=\"prev available\"></th>\n                        </ng-container>\n                        <ng-container\n                            *ngIf=\"\n                                !(\n                                    (!calendarVariables.right.minDate ||\n                                        calendarVariables.right.minDate.isBefore(calendarVariables.right.calendar.firstDay)) &&\n                                    !this.linkedCalendars\n                                )\n                            \">\n                            <th></th>\n                        </ng-container>\n                        <th colspan=\"5\" class=\"month\">\n                            <ng-container *ngIf=\"showDropdowns && calendarVariables.right.dropdowns\">\n                                <div class=\"dropdowns\">\n                                    {{ this.locale.monthNames[calendarVariables?.right?.calendar[1][1].month()] }}\n                                    <select class=\"monthselect\" (change)=\"monthChanged($event, sideEnum.right)\">\n                                        <option\n                                            [disabled]=\"\n                                                (calendarVariables.right.dropdowns.inMinYear &&\n                                                    calendarVariables.right.minDate &&\n                                                    m < calendarVariables.right.minDate.month()) ||\n                                                (calendarVariables.right.dropdowns.inMaxYear &&\n                                                    calendarVariables.right.maxDate &&\n                                                    m > calendarVariables.right.maxDate.month())\n                                            \"\n                                            *ngFor=\"let m of calendarVariables.right.dropdowns.monthArrays\"\n                                            [value]=\"m\"\n                                            [selected]=\"calendarVariables.right.dropdowns.currentMonth === m\">\n                                            {{ locale.monthNames[m] }}\n                                        </option>\n                                    </select>\n                                </div>\n                                <div class=\"dropdowns\">\n                                    {{ calendarVariables?.right?.calendar[1][1].format(' YYYY') }}\n                                    <select class=\"yearselect\" (change)=\"yearChanged($event, sideEnum.right)\">\n                                        <option\n                                            *ngFor=\"let y of calendarVariables.right.dropdowns.yearArrays\"\n                                            [selected]=\"y === calendarVariables.right.dropdowns.currentYear\">\n                                            {{ y }}\n                                        </option>\n                                    </select>\n                                </div>\n                            </ng-container>\n                            <ng-container *ngIf=\"!showDropdowns || !calendarVariables.right.dropdowns\">\n                                {{ this.locale.monthNames[calendarVariables?.right?.calendar[1][1].month()] }}\n                                {{ calendarVariables?.right?.calendar[1][1].format(' YYYY') }}\n                            </ng-container>\n                        </th>\n                        <ng-container\n                            *ngIf=\"\n                                !calendarVariables.right.maxDate ||\n                                (calendarVariables.right.maxDate.isAfter(calendarVariables.right.calendar.lastDay) &&\n                                    (!linkedCalendars || singleDatePicker || true))\n                            \">\n                            <th class=\"next available\" (click)=\"clickNext(sideEnum.right)\"></th>\n                        </ng-container>\n                        <ng-container\n                            *ngIf=\"\n                                !(\n                                    !calendarVariables.right.maxDate ||\n                                    (calendarVariables.right.maxDate.isAfter(calendarVariables.right.calendar.lastDay) &&\n                                        (!linkedCalendars || singleDatePicker || true))\n                                )\n                            \">\n                            <th></th>\n                        </ng-container>\n                    </tr>\n\n                    <tr class=\"week-days\">\n                        <th *ngIf=\"showWeekNumbers || showISOWeekNumbers\" class=\"week\">\n                            <span>{{ this.locale.weekLabel }}</span>\n                        </th>\n                        <th *ngFor=\"let dayofweek of locale.daysOfWeek\">\n                            <span>{{ dayofweek }}</span>\n                        </th>\n                    </tr>\n                </thead>\n                <tbody>\n                    <tr *ngFor=\"let row of calendarVariables.right.calRows\" [class]=\"calendarVariables.right.classes[row].classList\">\n                        <td class=\"week\" *ngIf=\"showWeekNumbers\">\n                            <span>{{ calendarVariables.right.calendar[row][0].week() }}</span>\n                        </td>\n                        <td class=\"week\" *ngIf=\"showISOWeekNumbers\">\n                            <span>{{ calendarVariables.right.calendar[row][0].isoWeek() }}</span>\n                        </td>\n                        <td\n                            *ngFor=\"let col of calendarVariables.right.calCols\"\n                            [class]=\"calendarVariables.right.classes[row][col]\"\n                            (click)=\"clickDate($event, sideEnum.right, row, col)\"\n                            (mouseenter)=\"hoverDate($event, sideEnum.right, row, col)\">\n                            <span>{{ calendarVariables.right.calendar[row][col].date() }}</span>\n                        </td>\n                    </tr>\n                </tbody>\n            </table>\n        </div>\n        <div class=\"calendar-time\" *ngIf=\"timePicker\">\n            <div class=\"select\">\n                <select\n                    class=\"select-item hourselect\"\n                    [disabled]=\"!startDate\"\n                    [(ngModel)]=\"timepickerVariables.right.selectedHour\"\n                    (ngModelChange)=\"timeChanged($event, sideEnum.right)\">\n                    <option\n                        *ngFor=\"let i of timepickerVariables.right.hours\"\n                        [value]=\"i\"\n                        [disabled]=\"timepickerVariables.right.disabledHours.indexOf(i) > -1\">\n                        {{ i }}\n                    </option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n            <div class=\"select\">\n                <select\n                    class=\"select-item minuteselect\"\n                    [disabled]=\"!startDate\"\n                    [(ngModel)]=\"timepickerVariables.right.selectedMinute\"\n                    (ngModelChange)=\"timeChanged($event, sideEnum.right)\">\n                    <option\n                        *ngFor=\"let i of timepickerVariables.right.minutes; let index = index\"\n                        [value]=\"i\"\n                        [disabled]=\"timepickerVariables.right.disabledMinutes.indexOf(i) > -1\">\n                        {{ timepickerVariables.right.minutesLabel[index] }}\n                    </option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n            <div class=\"select\">\n                <select\n                    *ngIf=\"timePickerSeconds\"\n                    class=\"select-item secondselect\"\n                    [disabled]=\"!startDate\"\n                    [(ngModel)]=\"timepickerVariables.right.selectedSecond\"\n                    (ngModelChange)=\"timeChanged($event, sideEnum.right)\">\n                    <option\n                        *ngFor=\"let i of timepickerVariables.right.seconds; let index = index\"\n                        [value]=\"i\"\n                        [disabled]=\"timepickerVariables.right.disabledSeconds.indexOf(i) > -1\">\n                        {{ timepickerVariables.right.secondsLabel[index] }}\n                    </option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n            <div class=\"select\">\n                <select\n                    *ngIf=\"!timePicker24Hour\"\n                    class=\"select-item ampmselect\"\n                    [(ngModel)]=\"timepickerVariables.right.ampmModel\"\n                    (ngModelChange)=\"timeChanged($event, sideEnum.right)\">\n                    <option value=\"AM\" [disabled]=\"timepickerVariables.right.amDisabled\">AM</option>\n                    <option value=\"PM\" [disabled]=\"timepickerVariables.right.pmDisabled\">PM</option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n        </div>\n    </div>\n    <div class=\"buttons\" *ngIf=\"!autoApply && (!rangesArray.length || (showCalInRanges && !singleDatePicker))\">\n        <div class=\"buttons_input\">\n            <button *ngIf=\"showClearButton\" class=\"btn btn-default clear\" type=\"button\" (click)=\"clear()\" [title]=\"locale.clearLabel\">\n                {{ locale.clearLabel }}\n                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"30\" height=\"30\" viewBox=\"0 -5 24 24\">\n                    <path d=\"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z\" />\n                </svg>\n            </button>\n            <button class=\"btn btn-default\" *ngIf=\"showCancel\" type=\"button\" (click)=\"clickCancel($event)\">{{ locale.cancelLabel }}</button>\n            <button class=\"btn\" [disabled]=\"applyBtn.disabled\" type=\"button\" (click)=\"clickApply($event)\">{{ locale.applyLabel }}</button>\n        </div>\n    </div>\n</div>\n", styles: [".md-drppicker{position:absolute;font-family:Roboto,sans-serif;color:inherit;border-radius:4px;width:278px;padding:4px;margin-top:-10px;overflow:hidden;z-index:1000;font-size:14px;background-color:#fff;box-shadow:0 2px 4px #00000029,0 2px 8px #0000001f}.md-drppicker.double{width:auto}.md-drppicker.inline{position:relative;display:inline-block}.md-drppicker:before,.md-drppicker:after{position:absolute;display:inline-block;border-bottom-color:#0003;content:\"\"}.md-drppicker.openscenter:before{left:0;right:0;width:0;margin-left:auto;margin-right:auto}.md-drppicker.openscenter:after{left:0;right:0;width:0;margin-left:auto;margin-right:auto}.md-drppicker.single .ranges,.md-drppicker.single .calendar{float:none}.md-drppicker.shown{transform:scale(1);transition:all .1s ease-in-out;transform-origin:0 0;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}.md-drppicker.shown.drops-up-left{transform-origin:100% 100%}.md-drppicker.shown.drops-up-right{transform-origin:0 100%}.md-drppicker.shown.drops-down-left{transform-origin:100% 0}.md-drppicker.shown.drops-down-right{transform-origin:0 0}.md-drppicker.shown.drops-down-center{transform-origin:NaN%}.md-drppicker.shown.drops-up-center{transform-origin:50%}.md-drppicker.shown .calendar{display:block}.md-drppicker.hidden{transition:all .1s ease;transform:scale(0);transform-origin:0 0;cursor:default;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}.md-drppicker.hidden.drops-up-left{transform-origin:100% 100%}.md-drppicker.hidden.drops-up-right{transform-origin:0 100%}.md-drppicker.hidden.drops-down-left{transform-origin:100% 0}.md-drppicker.hidden.drops-down-right{transform-origin:0 0}.md-drppicker.hidden.drops-down-center{transform-origin:50% 0}.md-drppicker.hidden.drops-up-center{transform-origin:50% 100%}.md-drppicker.hidden .calendar{display:none}.md-drppicker .calendar{max-width:270px;margin:4px}.md-drppicker .calendar.single .calendar-table{border:none}.md-drppicker .calendar th,.md-drppicker .calendar td{padding:0;white-space:nowrap;text-align:center;min-width:32px}.md-drppicker .calendar th span,.md-drppicker .calendar td span{pointer-events:none}.md-drppicker .calendar-table{border:1px solid #fff;padding:4px;border-radius:4px;background-color:#fff}.md-drppicker table{width:100%;margin:0}.md-drppicker th{color:#988c8c}.md-drppicker td,.md-drppicker th{text-align:center;width:20px;height:20px;border-radius:4px;border:1px solid transparent;white-space:nowrap;cursor:pointer;height:2em;width:2em}.md-drppicker td.available.prev,.md-drppicker th.available.prev{display:block;background-image:url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMy43IDYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDMuNyA2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxwYXRoIGQ9Ik0zLjcsMC43TDEuNCwzbDIuMywyLjNMMyw2TDAsM2wzLTNMMy43LDAuN3oiLz4NCjwvZz4NCjwvc3ZnPg0K);background-repeat:no-repeat;background-size:.5em;background-position:center;opacity:.8;transition:background-color .2s ease;border-radius:2em}.md-drppicker td.available.prev:hover,.md-drppicker th.available.prev:hover{margin:0}.md-drppicker td.available.next,.md-drppicker th.available.next{transform:rotate(180deg);display:block;background-image:url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMy43IDYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDMuNyA2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxwYXRoIGQ9Ik0zLjcsMC43TDEuNCwzbDIuMywyLjNMMyw2TDAsM2wzLTNMMy43LDAuN3oiLz4NCjwvZz4NCjwvc3ZnPg0K);background-repeat:no-repeat;background-size:.5em;background-position:center;opacity:.8;transition:background-color .2s ease;border-radius:2em}.md-drppicker td.available.next:hover,.md-drppicker th.available.next:hover{margin:0;transform:rotate(180deg)}.md-drppicker td.available:hover,.md-drppicker th.available:hover{background-color:#eee;border-color:transparent;color:inherit;background-repeat:no-repeat;background-size:.5em;background-position:center;margin:.25em 0;opacity:.8;border-radius:2em;transform:scale(1);transition:all .45s cubic-bezier(.23,1,.32,1) 0ms}.md-drppicker td.week,.md-drppicker th.week{font-size:80%;color:#ccc}.md-drppicker td{margin:.25em 0;opacity:.8;transition:background-color .2s ease;border-radius:2em;transform:scale(1);transition:all .45s cubic-bezier(.23,1,.32,1) 0ms}.md-drppicker td.off,.md-drppicker td.off.in-range,.md-drppicker td.off.start-date,.md-drppicker td.off.end-date{background-color:#fff;border-color:transparent;color:#999}.md-drppicker td.in-range{background-color:#dde2e4;border-color:transparent;color:#000;border-radius:0}.md-drppicker td.start-date{border-radius:2em 0 0 2em}.md-drppicker td.end-date{border-radius:0 2em 2em 0}.md-drppicker td.start-date.end-date{border-radius:4px}.md-drppicker td.active{transition:background .3s ease-out;background:rgba(0,0,0,.1)}.md-drppicker td.active,.md-drppicker td.active:hover{background-color:#3f51b5;border-color:transparent;color:#fff}.md-drppicker th.month{width:auto}.md-drppicker td.disabled,.md-drppicker option.disabled{color:#999;cursor:not-allowed;text-decoration:line-through}.md-drppicker .dropdowns{background-repeat:no-repeat;background-size:10px;background-position-y:center;background-position-x:right;width:50px;background-image:url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDI1NSAyNTUiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI1NSAyNTU7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8ZyBpZD0iYXJyb3ctZHJvcC1kb3duIj4KCQk8cG9seWdvbiBwb2ludHM9IjAsNjMuNzUgMTI3LjUsMTkxLjI1IDI1NSw2My43NSAgICIgZmlsbD0iIzk4OGM4YyIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=)}.md-drppicker .dropdowns select{display:inline-block;background-color:#ffffffe6;width:100%;padding:5px;border:1px solid #f2f2f2;border-radius:2px;height:3rem}.md-drppicker .dropdowns select.monthselect,.md-drppicker .dropdowns select.yearselect{font-size:12px;padding:1px;height:auto;margin:0;cursor:default}.md-drppicker .dropdowns select.hourselect,.md-drppicker .dropdowns select.minuteselect,.md-drppicker .dropdowns select.secondselect,.md-drppicker .dropdowns select.ampmselect{width:50px;margin:0 auto;background:#eee;border:1px solid #eee;padding:2px;outline:0;font-size:12px}.md-drppicker .dropdowns select.monthselect,.md-drppicker .dropdowns select.yearselect{cursor:pointer;opacity:0;position:absolute;top:0;left:0;margin:0;padding:0}.md-drppicker th.month>div{position:relative;display:inline-block}.md-drppicker .calendar-time{text-align:center;margin:4px auto 0;line-height:30px;position:relative}.md-drppicker .calendar-time .select{display:inline}.md-drppicker .calendar-time .select .select-item{display:inline-block;width:auto;position:relative;font-family:inherit;background-color:transparent;padding:10px 10px 10px 0;font-size:18px;border-radius:0;border:none;border-bottom:1px solid rgba(0,0,0,.12)}.md-drppicker .calendar-time .select .select-item:after{position:absolute;top:18px;right:10px;width:0;height:0;padding:0;content:\"\";border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid rgba(0,0,0,.12);pointer-events:none}.md-drppicker .calendar-time .select .select-item:focus{outline:none}.md-drppicker .calendar-time .select .select-item .select-label{color:#00000042;font-size:16px;font-weight:400;position:absolute;pointer-events:none;left:0;top:10px;transition:.2s ease all}.md-drppicker .calendar-time select.disabled{color:#ccc;cursor:not-allowed}.md-drppicker .label-input{border:1px solid #ccc;border-radius:4px;color:#555;height:30px;line-height:30px;display:block;vertical-align:middle;margin:0 auto 5px;padding:0 0 0 28px;width:100%}.md-drppicker .label-input.active{border:1px solid #08c;border-radius:4px}.md-drppicker .md-drppicker_input{position:relative;padding:0 30px 0 0}.md-drppicker .md-drppicker_input i,.md-drppicker .md-drppicker_input svg{position:absolute;left:8px;top:8px}.md-drppicker.rtl .label-input{padding-right:28px;padding-left:6px}.md-drppicker.rtl .md-drppicker_input i,.md-drppicker.rtl .md-drppicker_input svg{left:auto;right:8px}.md-drppicker .show-ranges .drp-calendar.left{border-left:1px solid #ddd}.md-drppicker .ranges{float:none;text-align:left;margin:0}.md-drppicker .ranges ul{list-style:none;margin:0 auto;padding:0;width:100%}.md-drppicker .ranges ul li{font-size:12px}.md-drppicker .ranges ul li button{padding:8px 12px;width:100%;background:none;border:none;text-align:left;cursor:pointer}.md-drppicker .ranges ul li button.active{background-color:#3f51b5;color:#fff}.md-drppicker .ranges ul li button[disabled]{opacity:.3}.md-drppicker .ranges ul li button:active{background:transparent}.md-drppicker .ranges ul li:hover{background-color:#eee}.md-drppicker .show-calendar .ranges{margin-top:8px}.md-drppicker [hidden]{display:none}.md-drppicker .buttons{text-align:right;margin:0 5px 5px 0}.md-drppicker .btn{position:relative;overflow:hidden;border-width:0;outline:none;padding:0 6px;cursor:pointer;border-radius:2px;box-shadow:0 1px 4px #0009;background-color:#3f51b5;color:#ecf0f1;transition:background-color .4s;height:auto;text-transform:uppercase;line-height:36px;border:none}.md-drppicker .btn:hover,.md-drppicker .btn:focus{background-color:#3f51b5}.md-drppicker .btn>*{position:relative}.md-drppicker .btn span{display:block;padding:12px 24px}.md-drppicker .btn:before{content:\"\";position:absolute;top:50%;left:50%;display:block;width:0;padding-top:0;border-radius:100%;background-color:#ecf0f14d;transform:translate(-50%,-50%)}.md-drppicker .btn:active:before{width:120%;padding-top:120%;transition:width .2s ease-out,padding-top .2s ease-out}.md-drppicker .btn:disabled{opacity:.5}.md-drppicker .btn.btn-default{color:#000;background-color:#dcdcdc}.md-drppicker .clear{box-shadow:none;background-color:#fff!important}.md-drppicker .clear svg{color:#eb3232;fill:currentColor}@media (min-width: 564px){.md-drppicker{width:auto}.md-drppicker.single .calendar.left{clear:none}.md-drppicker.ltr{direction:ltr;text-align:left}.md-drppicker.ltr .calendar.left{clear:left}.md-drppicker.ltr .calendar.left .calendar-table{border-right:none;border-top-right-radius:0;border-bottom-right-radius:0}.md-drppicker.ltr .calendar.right{margin-left:0}.md-drppicker.ltr .calendar.right .calendar-table{border-left:none;border-top-left-radius:0;border-bottom-left-radius:0}.md-drppicker.ltr .left .md-drppicker_input,.md-drppicker.ltr .right .md-drppicker_input{padding-right:35px}.md-drppicker.ltr .calendar.left .calendar-table{padding-right:12px}.md-drppicker.ltr .ranges,.md-drppicker.ltr .calendar{float:left}.md-drppicker.rtl{direction:rtl;text-align:right}.md-drppicker.rtl .calendar.left{clear:right;margin-left:0}.md-drppicker.rtl .calendar.left .calendar-table{border-left:none;border-top-left-radius:0;border-bottom-left-radius:0}.md-drppicker.rtl .calendar.right{margin-right:0}.md-drppicker.rtl .calendar.right .calendar-table{border-right:none;border-top-right-radius:0;border-bottom-right-radius:0}.md-drppicker.rtl .left .md-drppicker_input,.md-drppicker.rtl .calendar.left .calendar-table{padding-left:12px}.md-drppicker.rtl .ranges,.md-drppicker.rtl .calendar{text-align:right;float:right}.drp-animate{transform:translate(0);transition:transform .2s ease,opacity .2s ease}.drp-animate.drp-picker-site-this{transition-timing-function:linear}.drp-animate.drp-animate-right{transform:translate(10%);opacity:0}.drp-animate.drp-animate-left{transform:translate(-10%);opacity:0}}@media (min-width: 730px){.md-drppicker .ranges{width:auto}.md-drppicker.ltr .ranges{float:left}.md-drppicker.rtl .ranges{float:right}.md-drppicker .calendar.left{clear:none!important}}\n"], directives: [{ type: i2.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: i2.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { type: i3.NgSelectOption, selector: "option", inputs: ["ngValue", "value"] }, { type: i3.ɵNgSelectMultipleOption, selector: "option", inputs: ["ngValue", "value"] }, { type: i3.SelectControlValueAccessor, selector: "select:not([multiple])[formControlName],select:not([multiple])[formControl],select:not([multiple])[ngModel]", inputs: ["compareWith"] }, { type: i3.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { type: i3.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }], encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: DaterangepickerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-daterangepicker-material', encapsulation: ViewEncapsulation.None, providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => DaterangepickerComponent),
                            multi: true
                        }
                    ], template: "<div\n    class=\"md-drppicker\"\n    #pickerContainer\n    [ngClass]=\"{\n        ltr: locale.direction === 'ltr',\n        rtl: this.locale.direction === 'rtl',\n        shown: isShown || inline,\n        hidden: !isShown && !inline,\n        inline: inline,\n        double: !singleDatePicker && showCalInRanges,\n        'show-ranges': rangesArray.length\n    }\"\n    [class]=\"'drops-' + drops + '-' + opens\">\n    <ng-container *ngIf=\"rangesArray.length\">\n        <div class=\"ranges\">\n            <ul>\n                <li *ngFor=\"let range of rangesArray\">\n                    <button\n                        type=\"button\"\n                        (click)=\"clickRange($event, range)\"\n                        [disabled]=\"disableRange(range)\"\n                        [ngClass]=\"{ active: range === chosenRange }\">\n                        {{ range }}\n                    </button>\n                </li>\n            </ul>\n        </div>\n    </ng-container>\n    <div class=\"calendar\" [ngClass]=\"{ right: singleDatePicker, left: !singleDatePicker }\" *ngIf=\"showCalInRanges\">\n        <div class=\"calendar-table\">\n            <table class=\"table-condensed\" *ngIf=\"calendarVariables\">\n                <thead>\n                    <tr>\n                        <th *ngIf=\"showWeekNumbers || showISOWeekNumbers\"></th>\n                        <ng-container\n                            *ngIf=\"\n                                !calendarVariables.left.minDate ||\n                                (calendarVariables.left.minDate.isBefore(calendarVariables.left.calendar.firstDay) &&\n                                    (!this.linkedCalendars || true))\n                            \">\n                            <th (click)=\"clickPrev(sideEnum.left)\" class=\"prev available\"></th>\n                        </ng-container>\n                        <ng-container\n                            *ngIf=\"\n                                !(\n                                    !calendarVariables.left.minDate ||\n                                    (calendarVariables.left.minDate.isBefore(calendarVariables.left.calendar.firstDay) &&\n                                        (!this.linkedCalendars || true))\n                                )\n                            \">\n                            <th></th>\n                        </ng-container>\n                        <th colspan=\"5\" class=\"month drp-animate\">\n                            <ng-container *ngIf=\"showDropdowns && calendarVariables.left.dropdowns\">\n                                <div class=\"dropdowns\">\n                                    {{ this.locale.monthNames[calendarVariables?.left?.calendar[1][1].month()] }}\n                                    <select class=\"monthselect\" (change)=\"monthChanged($event, sideEnum.left)\">\n                                        <option\n                                            [disabled]=\"\n                                                (calendarVariables.left.dropdowns.inMinYear &&\n                                                    m < calendarVariables.left.minDate.month()) ||\n                                                (calendarVariables.left.dropdowns.inMaxYear && m > calendarVariables.left.maxDate.month())\n                                            \"\n                                            *ngFor=\"let m of calendarVariables.left.dropdowns.monthArrays\"\n                                            [value]=\"m\"\n                                            [selected]=\"calendarVariables.left.dropdowns.currentMonth === m\">\n                                            {{ locale.monthNames[m] }}\n                                        </option>\n                                    </select>\n                                </div>\n                                <div class=\"dropdowns\">\n                                    {{ calendarVariables?.left?.calendar[1][1].format(' YYYY') }}\n                                    <select class=\"yearselect\" (change)=\"yearChanged($event, sideEnum.left)\">\n                                        <option\n                                            *ngFor=\"let y of calendarVariables.left.dropdowns.yearArrays\"\n                                            [selected]=\"y === calendarVariables.left.dropdowns.currentYear\">\n                                            {{ y }}\n                                        </option>\n                                    </select>\n                                </div>\n                            </ng-container>\n                            <ng-container *ngIf=\"!showDropdowns || !calendarVariables.left.dropdowns\">\n                                {{ this.locale.monthNames[calendarVariables?.left?.calendar[1][1].month()] }}\n                                {{ calendarVariables?.left?.calendar[1][1].format(' YYYY') }}\n                            </ng-container>\n                        </th>\n                        <ng-container\n                            *ngIf=\"\n                                (!calendarVariables.left.maxDate ||\n                                    calendarVariables.left.maxDate.isAfter(calendarVariables.left.calendar.lastDay)) &&\n                                (!linkedCalendars || singleDatePicker)\n                            \">\n                            <th class=\"next available\" (click)=\"clickNext(sideEnum.left)\"></th>\n                        </ng-container>\n                        <ng-container\n                            *ngIf=\"\n                                !(\n                                    (!calendarVariables.left.maxDate ||\n                                        calendarVariables.left.maxDate.isAfter(calendarVariables.left.calendar.lastDay)) &&\n                                    (!linkedCalendars || singleDatePicker)\n                                )\n                            \">\n                            <th></th>\n                        </ng-container>\n                    </tr>\n                    <tr class=\"week-days\">\n                        <th *ngIf=\"showWeekNumbers || showISOWeekNumbers\" class=\"week\">\n                            <span>{{ this.locale.weekLabel }}</span>\n                        </th>\n                        <th *ngFor=\"let dayofweek of locale.daysOfWeek\">\n                            <span>{{ dayofweek }}</span>\n                        </th>\n                    </tr>\n                </thead>\n                <tbody class=\"drp-animate\">\n                    <tr *ngFor=\"let row of calendarVariables.left.calRows\" [class]=\"calendarVariables.left.classes[row].classList\">\n                        <!-- add week number -->\n                        <td class=\"week\" *ngIf=\"showWeekNumbers\">\n                            <span>{{ calendarVariables.left.calendar[row][0].week() }}</span>\n                        </td>\n                        <td class=\"week\" *ngIf=\"showISOWeekNumbers\">\n                            <span>{{ calendarVariables.left.calendar[row][0].isoWeek() }}</span>\n                        </td>\n                        <!-- cal -->\n                        <td\n                            *ngFor=\"let col of calendarVariables.left.calCols\"\n                            [class]=\"calendarVariables.left.classes[row][col]\"\n                            (click)=\"clickDate($event, sideEnum.left, row, col)\"\n                            (mouseenter)=\"hoverDate($event, sideEnum.left, row, col)\">\n                            <span>{{ calendarVariables.left.calendar[row][col].date() }}</span>\n                        </td>\n                    </tr>\n                </tbody>\n            </table>\n        </div>\n        <div class=\"calendar-time\" *ngIf=\"timePicker\">\n            <div class=\"select\">\n                <select\n                    class=\"hourselect select-item\"\n                    [disabled]=\"!startDate\"\n                    [(ngModel)]=\"timepickerVariables.left.selectedHour\"\n                    (ngModelChange)=\"timeChanged($event, sideEnum.left)\">\n                    <option\n                        *ngFor=\"let i of timepickerVariables.left.hours\"\n                        [value]=\"i\"\n                        [disabled]=\"timepickerVariables.left.disabledHours.indexOf(i) > -1\">\n                        {{ i }}\n                    </option>\n                </select>\n            </div>\n            <div class=\"select\">\n                <select\n                    class=\"select-item minuteselect\"\n                    [disabled]=\"!startDate\"\n                    [(ngModel)]=\"timepickerVariables.left.selectedMinute\"\n                    (ngModelChange)=\"timeChanged($event, sideEnum.left)\">\n                    <option\n                        *ngFor=\"let i of timepickerVariables.left.minutes; let index = index\"\n                        [value]=\"i\"\n                        [disabled]=\"timepickerVariables.left.disabledMinutes.indexOf(i) > -1\">\n                        {{ timepickerVariables.left.minutesLabel[index] }}\n                    </option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n            <div class=\"select\">\n                <select\n                    class=\"select-item secondselect\"\n                    *ngIf=\"timePickerSeconds\"\n                    [disabled]=\"!startDate\"\n                    [(ngModel)]=\"timepickerVariables.left.selectedSecond\"\n                    (ngModelChange)=\"timeChanged($event, sideEnum.left)\">\n                    <option\n                        *ngFor=\"let i of timepickerVariables.left.seconds; let index = index\"\n                        [value]=\"i\"\n                        [disabled]=\"timepickerVariables.left.disabledSeconds.indexOf(i) > -1\">\n                        {{ timepickerVariables.left.secondsLabel[index] }}\n                    </option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n            <div class=\"select\">\n                <select\n                    class=\"select-item ampmselect\"\n                    *ngIf=\"!timePicker24Hour\"\n                    [(ngModel)]=\"timepickerVariables.left.ampmModel\"\n                    (ngModelChange)=\"timeChanged($event, sideEnum.left)\">\n                    <option value=\"AM\" [disabled]=\"timepickerVariables.left.amDisabled\">AM</option>\n                    <option value=\"PM\" [disabled]=\"timepickerVariables.left.pmDisabled\">PM</option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n        </div>\n    </div>\n    <div class=\"calendar right\" *ngIf=\"showCalInRanges && !singleDatePicker\">\n        <div class=\"calendar-table\">\n            <table class=\"table-condensed\" *ngIf=\"calendarVariables\">\n                <thead>\n                    <tr>\n                        <th *ngIf=\"showWeekNumbers || showISOWeekNumbers\"></th>\n                        <ng-container\n                            *ngIf=\"\n                                (!calendarVariables.right.minDate ||\n                                    calendarVariables.right.minDate.isBefore(calendarVariables.right.calendar.firstDay)) &&\n                                !this.linkedCalendars\n                            \">\n                            <th (click)=\"clickPrev(sideEnum.right)\" class=\"prev available\"></th>\n                        </ng-container>\n                        <ng-container\n                            *ngIf=\"\n                                !(\n                                    (!calendarVariables.right.minDate ||\n                                        calendarVariables.right.minDate.isBefore(calendarVariables.right.calendar.firstDay)) &&\n                                    !this.linkedCalendars\n                                )\n                            \">\n                            <th></th>\n                        </ng-container>\n                        <th colspan=\"5\" class=\"month\">\n                            <ng-container *ngIf=\"showDropdowns && calendarVariables.right.dropdowns\">\n                                <div class=\"dropdowns\">\n                                    {{ this.locale.monthNames[calendarVariables?.right?.calendar[1][1].month()] }}\n                                    <select class=\"monthselect\" (change)=\"monthChanged($event, sideEnum.right)\">\n                                        <option\n                                            [disabled]=\"\n                                                (calendarVariables.right.dropdowns.inMinYear &&\n                                                    calendarVariables.right.minDate &&\n                                                    m < calendarVariables.right.minDate.month()) ||\n                                                (calendarVariables.right.dropdowns.inMaxYear &&\n                                                    calendarVariables.right.maxDate &&\n                                                    m > calendarVariables.right.maxDate.month())\n                                            \"\n                                            *ngFor=\"let m of calendarVariables.right.dropdowns.monthArrays\"\n                                            [value]=\"m\"\n                                            [selected]=\"calendarVariables.right.dropdowns.currentMonth === m\">\n                                            {{ locale.monthNames[m] }}\n                                        </option>\n                                    </select>\n                                </div>\n                                <div class=\"dropdowns\">\n                                    {{ calendarVariables?.right?.calendar[1][1].format(' YYYY') }}\n                                    <select class=\"yearselect\" (change)=\"yearChanged($event, sideEnum.right)\">\n                                        <option\n                                            *ngFor=\"let y of calendarVariables.right.dropdowns.yearArrays\"\n                                            [selected]=\"y === calendarVariables.right.dropdowns.currentYear\">\n                                            {{ y }}\n                                        </option>\n                                    </select>\n                                </div>\n                            </ng-container>\n                            <ng-container *ngIf=\"!showDropdowns || !calendarVariables.right.dropdowns\">\n                                {{ this.locale.monthNames[calendarVariables?.right?.calendar[1][1].month()] }}\n                                {{ calendarVariables?.right?.calendar[1][1].format(' YYYY') }}\n                            </ng-container>\n                        </th>\n                        <ng-container\n                            *ngIf=\"\n                                !calendarVariables.right.maxDate ||\n                                (calendarVariables.right.maxDate.isAfter(calendarVariables.right.calendar.lastDay) &&\n                                    (!linkedCalendars || singleDatePicker || true))\n                            \">\n                            <th class=\"next available\" (click)=\"clickNext(sideEnum.right)\"></th>\n                        </ng-container>\n                        <ng-container\n                            *ngIf=\"\n                                !(\n                                    !calendarVariables.right.maxDate ||\n                                    (calendarVariables.right.maxDate.isAfter(calendarVariables.right.calendar.lastDay) &&\n                                        (!linkedCalendars || singleDatePicker || true))\n                                )\n                            \">\n                            <th></th>\n                        </ng-container>\n                    </tr>\n\n                    <tr class=\"week-days\">\n                        <th *ngIf=\"showWeekNumbers || showISOWeekNumbers\" class=\"week\">\n                            <span>{{ this.locale.weekLabel }}</span>\n                        </th>\n                        <th *ngFor=\"let dayofweek of locale.daysOfWeek\">\n                            <span>{{ dayofweek }}</span>\n                        </th>\n                    </tr>\n                </thead>\n                <tbody>\n                    <tr *ngFor=\"let row of calendarVariables.right.calRows\" [class]=\"calendarVariables.right.classes[row].classList\">\n                        <td class=\"week\" *ngIf=\"showWeekNumbers\">\n                            <span>{{ calendarVariables.right.calendar[row][0].week() }}</span>\n                        </td>\n                        <td class=\"week\" *ngIf=\"showISOWeekNumbers\">\n                            <span>{{ calendarVariables.right.calendar[row][0].isoWeek() }}</span>\n                        </td>\n                        <td\n                            *ngFor=\"let col of calendarVariables.right.calCols\"\n                            [class]=\"calendarVariables.right.classes[row][col]\"\n                            (click)=\"clickDate($event, sideEnum.right, row, col)\"\n                            (mouseenter)=\"hoverDate($event, sideEnum.right, row, col)\">\n                            <span>{{ calendarVariables.right.calendar[row][col].date() }}</span>\n                        </td>\n                    </tr>\n                </tbody>\n            </table>\n        </div>\n        <div class=\"calendar-time\" *ngIf=\"timePicker\">\n            <div class=\"select\">\n                <select\n                    class=\"select-item hourselect\"\n                    [disabled]=\"!startDate\"\n                    [(ngModel)]=\"timepickerVariables.right.selectedHour\"\n                    (ngModelChange)=\"timeChanged($event, sideEnum.right)\">\n                    <option\n                        *ngFor=\"let i of timepickerVariables.right.hours\"\n                        [value]=\"i\"\n                        [disabled]=\"timepickerVariables.right.disabledHours.indexOf(i) > -1\">\n                        {{ i }}\n                    </option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n            <div class=\"select\">\n                <select\n                    class=\"select-item minuteselect\"\n                    [disabled]=\"!startDate\"\n                    [(ngModel)]=\"timepickerVariables.right.selectedMinute\"\n                    (ngModelChange)=\"timeChanged($event, sideEnum.right)\">\n                    <option\n                        *ngFor=\"let i of timepickerVariables.right.minutes; let index = index\"\n                        [value]=\"i\"\n                        [disabled]=\"timepickerVariables.right.disabledMinutes.indexOf(i) > -1\">\n                        {{ timepickerVariables.right.minutesLabel[index] }}\n                    </option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n            <div class=\"select\">\n                <select\n                    *ngIf=\"timePickerSeconds\"\n                    class=\"select-item secondselect\"\n                    [disabled]=\"!startDate\"\n                    [(ngModel)]=\"timepickerVariables.right.selectedSecond\"\n                    (ngModelChange)=\"timeChanged($event, sideEnum.right)\">\n                    <option\n                        *ngFor=\"let i of timepickerVariables.right.seconds; let index = index\"\n                        [value]=\"i\"\n                        [disabled]=\"timepickerVariables.right.disabledSeconds.indexOf(i) > -1\">\n                        {{ timepickerVariables.right.secondsLabel[index] }}\n                    </option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n            <div class=\"select\">\n                <select\n                    *ngIf=\"!timePicker24Hour\"\n                    class=\"select-item ampmselect\"\n                    [(ngModel)]=\"timepickerVariables.right.ampmModel\"\n                    (ngModelChange)=\"timeChanged($event, sideEnum.right)\">\n                    <option value=\"AM\" [disabled]=\"timepickerVariables.right.amDisabled\">AM</option>\n                    <option value=\"PM\" [disabled]=\"timepickerVariables.right.pmDisabled\">PM</option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n        </div>\n    </div>\n    <div class=\"buttons\" *ngIf=\"!autoApply && (!rangesArray.length || (showCalInRanges && !singleDatePicker))\">\n        <div class=\"buttons_input\">\n            <button *ngIf=\"showClearButton\" class=\"btn btn-default clear\" type=\"button\" (click)=\"clear()\" [title]=\"locale.clearLabel\">\n                {{ locale.clearLabel }}\n                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"30\" height=\"30\" viewBox=\"0 -5 24 24\">\n                    <path d=\"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z\" />\n                </svg>\n            </button>\n            <button class=\"btn btn-default\" *ngIf=\"showCancel\" type=\"button\" (click)=\"clickCancel($event)\">{{ locale.cancelLabel }}</button>\n            <button class=\"btn\" [disabled]=\"applyBtn.disabled\" type=\"button\" (click)=\"clickApply($event)\">{{ locale.applyLabel }}</button>\n        </div>\n    </div>\n</div>\n", styles: [".md-drppicker{position:absolute;font-family:Roboto,sans-serif;color:inherit;border-radius:4px;width:278px;padding:4px;margin-top:-10px;overflow:hidden;z-index:1000;font-size:14px;background-color:#fff;box-shadow:0 2px 4px #00000029,0 2px 8px #0000001f}.md-drppicker.double{width:auto}.md-drppicker.inline{position:relative;display:inline-block}.md-drppicker:before,.md-drppicker:after{position:absolute;display:inline-block;border-bottom-color:#0003;content:\"\"}.md-drppicker.openscenter:before{left:0;right:0;width:0;margin-left:auto;margin-right:auto}.md-drppicker.openscenter:after{left:0;right:0;width:0;margin-left:auto;margin-right:auto}.md-drppicker.single .ranges,.md-drppicker.single .calendar{float:none}.md-drppicker.shown{transform:scale(1);transition:all .1s ease-in-out;transform-origin:0 0;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}.md-drppicker.shown.drops-up-left{transform-origin:100% 100%}.md-drppicker.shown.drops-up-right{transform-origin:0 100%}.md-drppicker.shown.drops-down-left{transform-origin:100% 0}.md-drppicker.shown.drops-down-right{transform-origin:0 0}.md-drppicker.shown.drops-down-center{transform-origin:NaN%}.md-drppicker.shown.drops-up-center{transform-origin:50%}.md-drppicker.shown .calendar{display:block}.md-drppicker.hidden{transition:all .1s ease;transform:scale(0);transform-origin:0 0;cursor:default;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}.md-drppicker.hidden.drops-up-left{transform-origin:100% 100%}.md-drppicker.hidden.drops-up-right{transform-origin:0 100%}.md-drppicker.hidden.drops-down-left{transform-origin:100% 0}.md-drppicker.hidden.drops-down-right{transform-origin:0 0}.md-drppicker.hidden.drops-down-center{transform-origin:50% 0}.md-drppicker.hidden.drops-up-center{transform-origin:50% 100%}.md-drppicker.hidden .calendar{display:none}.md-drppicker .calendar{max-width:270px;margin:4px}.md-drppicker .calendar.single .calendar-table{border:none}.md-drppicker .calendar th,.md-drppicker .calendar td{padding:0;white-space:nowrap;text-align:center;min-width:32px}.md-drppicker .calendar th span,.md-drppicker .calendar td span{pointer-events:none}.md-drppicker .calendar-table{border:1px solid #fff;padding:4px;border-radius:4px;background-color:#fff}.md-drppicker table{width:100%;margin:0}.md-drppicker th{color:#988c8c}.md-drppicker td,.md-drppicker th{text-align:center;width:20px;height:20px;border-radius:4px;border:1px solid transparent;white-space:nowrap;cursor:pointer;height:2em;width:2em}.md-drppicker td.available.prev,.md-drppicker th.available.prev{display:block;background-image:url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMy43IDYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDMuNyA2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxwYXRoIGQ9Ik0zLjcsMC43TDEuNCwzbDIuMywyLjNMMyw2TDAsM2wzLTNMMy43LDAuN3oiLz4NCjwvZz4NCjwvc3ZnPg0K);background-repeat:no-repeat;background-size:.5em;background-position:center;opacity:.8;transition:background-color .2s ease;border-radius:2em}.md-drppicker td.available.prev:hover,.md-drppicker th.available.prev:hover{margin:0}.md-drppicker td.available.next,.md-drppicker th.available.next{transform:rotate(180deg);display:block;background-image:url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMy43IDYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDMuNyA2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxwYXRoIGQ9Ik0zLjcsMC43TDEuNCwzbDIuMywyLjNMMyw2TDAsM2wzLTNMMy43LDAuN3oiLz4NCjwvZz4NCjwvc3ZnPg0K);background-repeat:no-repeat;background-size:.5em;background-position:center;opacity:.8;transition:background-color .2s ease;border-radius:2em}.md-drppicker td.available.next:hover,.md-drppicker th.available.next:hover{margin:0;transform:rotate(180deg)}.md-drppicker td.available:hover,.md-drppicker th.available:hover{background-color:#eee;border-color:transparent;color:inherit;background-repeat:no-repeat;background-size:.5em;background-position:center;margin:.25em 0;opacity:.8;border-radius:2em;transform:scale(1);transition:all .45s cubic-bezier(.23,1,.32,1) 0ms}.md-drppicker td.week,.md-drppicker th.week{font-size:80%;color:#ccc}.md-drppicker td{margin:.25em 0;opacity:.8;transition:background-color .2s ease;border-radius:2em;transform:scale(1);transition:all .45s cubic-bezier(.23,1,.32,1) 0ms}.md-drppicker td.off,.md-drppicker td.off.in-range,.md-drppicker td.off.start-date,.md-drppicker td.off.end-date{background-color:#fff;border-color:transparent;color:#999}.md-drppicker td.in-range{background-color:#dde2e4;border-color:transparent;color:#000;border-radius:0}.md-drppicker td.start-date{border-radius:2em 0 0 2em}.md-drppicker td.end-date{border-radius:0 2em 2em 0}.md-drppicker td.start-date.end-date{border-radius:4px}.md-drppicker td.active{transition:background .3s ease-out;background:rgba(0,0,0,.1)}.md-drppicker td.active,.md-drppicker td.active:hover{background-color:#3f51b5;border-color:transparent;color:#fff}.md-drppicker th.month{width:auto}.md-drppicker td.disabled,.md-drppicker option.disabled{color:#999;cursor:not-allowed;text-decoration:line-through}.md-drppicker .dropdowns{background-repeat:no-repeat;background-size:10px;background-position-y:center;background-position-x:right;width:50px;background-image:url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDI1NSAyNTUiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI1NSAyNTU7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8ZyBpZD0iYXJyb3ctZHJvcC1kb3duIj4KCQk8cG9seWdvbiBwb2ludHM9IjAsNjMuNzUgMTI3LjUsMTkxLjI1IDI1NSw2My43NSAgICIgZmlsbD0iIzk4OGM4YyIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=)}.md-drppicker .dropdowns select{display:inline-block;background-color:#ffffffe6;width:100%;padding:5px;border:1px solid #f2f2f2;border-radius:2px;height:3rem}.md-drppicker .dropdowns select.monthselect,.md-drppicker .dropdowns select.yearselect{font-size:12px;padding:1px;height:auto;margin:0;cursor:default}.md-drppicker .dropdowns select.hourselect,.md-drppicker .dropdowns select.minuteselect,.md-drppicker .dropdowns select.secondselect,.md-drppicker .dropdowns select.ampmselect{width:50px;margin:0 auto;background:#eee;border:1px solid #eee;padding:2px;outline:0;font-size:12px}.md-drppicker .dropdowns select.monthselect,.md-drppicker .dropdowns select.yearselect{cursor:pointer;opacity:0;position:absolute;top:0;left:0;margin:0;padding:0}.md-drppicker th.month>div{position:relative;display:inline-block}.md-drppicker .calendar-time{text-align:center;margin:4px auto 0;line-height:30px;position:relative}.md-drppicker .calendar-time .select{display:inline}.md-drppicker .calendar-time .select .select-item{display:inline-block;width:auto;position:relative;font-family:inherit;background-color:transparent;padding:10px 10px 10px 0;font-size:18px;border-radius:0;border:none;border-bottom:1px solid rgba(0,0,0,.12)}.md-drppicker .calendar-time .select .select-item:after{position:absolute;top:18px;right:10px;width:0;height:0;padding:0;content:\"\";border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid rgba(0,0,0,.12);pointer-events:none}.md-drppicker .calendar-time .select .select-item:focus{outline:none}.md-drppicker .calendar-time .select .select-item .select-label{color:#00000042;font-size:16px;font-weight:400;position:absolute;pointer-events:none;left:0;top:10px;transition:.2s ease all}.md-drppicker .calendar-time select.disabled{color:#ccc;cursor:not-allowed}.md-drppicker .label-input{border:1px solid #ccc;border-radius:4px;color:#555;height:30px;line-height:30px;display:block;vertical-align:middle;margin:0 auto 5px;padding:0 0 0 28px;width:100%}.md-drppicker .label-input.active{border:1px solid #08c;border-radius:4px}.md-drppicker .md-drppicker_input{position:relative;padding:0 30px 0 0}.md-drppicker .md-drppicker_input i,.md-drppicker .md-drppicker_input svg{position:absolute;left:8px;top:8px}.md-drppicker.rtl .label-input{padding-right:28px;padding-left:6px}.md-drppicker.rtl .md-drppicker_input i,.md-drppicker.rtl .md-drppicker_input svg{left:auto;right:8px}.md-drppicker .show-ranges .drp-calendar.left{border-left:1px solid #ddd}.md-drppicker .ranges{float:none;text-align:left;margin:0}.md-drppicker .ranges ul{list-style:none;margin:0 auto;padding:0;width:100%}.md-drppicker .ranges ul li{font-size:12px}.md-drppicker .ranges ul li button{padding:8px 12px;width:100%;background:none;border:none;text-align:left;cursor:pointer}.md-drppicker .ranges ul li button.active{background-color:#3f51b5;color:#fff}.md-drppicker .ranges ul li button[disabled]{opacity:.3}.md-drppicker .ranges ul li button:active{background:transparent}.md-drppicker .ranges ul li:hover{background-color:#eee}.md-drppicker .show-calendar .ranges{margin-top:8px}.md-drppicker [hidden]{display:none}.md-drppicker .buttons{text-align:right;margin:0 5px 5px 0}.md-drppicker .btn{position:relative;overflow:hidden;border-width:0;outline:none;padding:0 6px;cursor:pointer;border-radius:2px;box-shadow:0 1px 4px #0009;background-color:#3f51b5;color:#ecf0f1;transition:background-color .4s;height:auto;text-transform:uppercase;line-height:36px;border:none}.md-drppicker .btn:hover,.md-drppicker .btn:focus{background-color:#3f51b5}.md-drppicker .btn>*{position:relative}.md-drppicker .btn span{display:block;padding:12px 24px}.md-drppicker .btn:before{content:\"\";position:absolute;top:50%;left:50%;display:block;width:0;padding-top:0;border-radius:100%;background-color:#ecf0f14d;transform:translate(-50%,-50%)}.md-drppicker .btn:active:before{width:120%;padding-top:120%;transition:width .2s ease-out,padding-top .2s ease-out}.md-drppicker .btn:disabled{opacity:.5}.md-drppicker .btn.btn-default{color:#000;background-color:#dcdcdc}.md-drppicker .clear{box-shadow:none;background-color:#fff!important}.md-drppicker .clear svg{color:#eb3232;fill:currentColor}@media (min-width: 564px){.md-drppicker{width:auto}.md-drppicker.single .calendar.left{clear:none}.md-drppicker.ltr{direction:ltr;text-align:left}.md-drppicker.ltr .calendar.left{clear:left}.md-drppicker.ltr .calendar.left .calendar-table{border-right:none;border-top-right-radius:0;border-bottom-right-radius:0}.md-drppicker.ltr .calendar.right{margin-left:0}.md-drppicker.ltr .calendar.right .calendar-table{border-left:none;border-top-left-radius:0;border-bottom-left-radius:0}.md-drppicker.ltr .left .md-drppicker_input,.md-drppicker.ltr .right .md-drppicker_input{padding-right:35px}.md-drppicker.ltr .calendar.left .calendar-table{padding-right:12px}.md-drppicker.ltr .ranges,.md-drppicker.ltr .calendar{float:left}.md-drppicker.rtl{direction:rtl;text-align:right}.md-drppicker.rtl .calendar.left{clear:right;margin-left:0}.md-drppicker.rtl .calendar.left .calendar-table{border-left:none;border-top-left-radius:0;border-bottom-left-radius:0}.md-drppicker.rtl .calendar.right{margin-right:0}.md-drppicker.rtl .calendar.right .calendar-table{border-right:none;border-top-right-radius:0;border-bottom-right-radius:0}.md-drppicker.rtl .left .md-drppicker_input,.md-drppicker.rtl .calendar.left .calendar-table{padding-left:12px}.md-drppicker.rtl .ranges,.md-drppicker.rtl .calendar{text-align:right;float:right}.drp-animate{transform:translate(0);transition:transform .2s ease,opacity .2s ease}.drp-animate.drp-picker-site-this{transition-timing-function:linear}.drp-animate.drp-animate-right{transform:translate(10%);opacity:0}.drp-animate.drp-animate-left{transform:translate(-10%);opacity:0}}@media (min-width: 730px){.md-drppicker .ranges{width:auto}.md-drppicker.ltr .ranges{float:left}.md-drppicker.rtl .ranges{float:right}.md-drppicker .calendar.left{clear:none!important}}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: LocaleService }]; }, propDecorators: { startDate: [{
                type: Input
            }], endDate: [{
                type: Input
            }], dateLimit: [{
                type: Input
            }], autoApply: [{
                type: Input
            }], singleDatePicker: [{
                type: Input
            }], showDropdowns: [{
                type: Input
            }], showWeekNumbers: [{
                type: Input
            }], showISOWeekNumbers: [{
                type: Input
            }], linkedCalendars: [{
                type: Input
            }], autoUpdateInput: [{
                type: Input
            }], alwaysShowCalendars: [{
                type: Input
            }], maxSpan: [{
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
            }], showClearButton: [{
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
            }], showCustomRangeLabel: [{
                type: Input
            }], showCancel: [{
                type: Input
            }], keepCalendarOpeningWithRange: [{
                type: Input
            }], showRangeLabelOnInput: [{
                type: Input
            }], customRangeDirection: [{
                type: Input
            }], drops: [{
                type: Input
            }], opens: [{
                type: Input
            }], closeOnAutoApply: [{
                type: Input
            }], choosedDate: [{
                type: Output
            }], rangeClicked: [{
                type: Output
            }], datesUpdated: [{
                type: Output
            }], startDateChanged: [{
                type: Output
            }], endDateChanged: [{
                type: Output
            }], cancelClicked: [{
                type: Output
            }], clearClicked: [{
                type: Output
            }], pickerContainer: [{
                type: ViewChild,
                args: ['pickerContainer', { static: true }]
            }], minDate: [{
                type: Input
            }], locale: [{
                type: Input
            }], ranges: [{
                type: Input
            }], maxDate: [{
                type: Input
            }], isInvalidDate: [{
                type: Input
            }], isCustomDate: [{
                type: Input
            }], isTooltipDate: [{
                type: Input
            }], handleInternalClick: [{
                type: HostListener,
                args: ['click', ['$event']]
            }] } });

class DaterangepickerDirective {
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
DaterangepickerDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: DaterangepickerDirective, deps: [{ token: i0.ViewContainerRef }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: i0.Renderer2 }, { token: i0.KeyValueDiffers }, { token: LocaleService }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
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
        }], ctorParameters: function () { return [{ type: i0.ViewContainerRef }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: i0.Renderer2 }, { type: i0.KeyValueDiffers }, { type: LocaleService }, { type: i0.ElementRef }]; }, propDecorators: { onChange: [{
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

class NgxDaterangepickerMd {
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

export { DaterangepickerComponent, DaterangepickerDirective, DefaultLocaleConfig, LOCALE_CONFIG, LocaleService, NgxDaterangepickerMd };
//# sourceMappingURL=ngx-daterangepicker-material.mjs.map
