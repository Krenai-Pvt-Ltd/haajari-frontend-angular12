
import { WeekDay } from "./WeekDay";
import { OrganizationWeekoffInformation } from "./organization-weekoff-information";
import { ShiftType } from "./shift-type";

export class OrganizationShiftTimingResponse {
    id : number = 0;
    name : string = '';
    inTime : string = '';
    outTime : string = '';
    startLunch : string = '';
    endLunch : string = '';
    inTimeDate?: Date;
    outTimeDate?: Date;
    startLunchDate?: Date;
    endLunchDate?: Date;
    workingHour : string = '';
    lunchHour : string = '';
    shiftType : ShiftType = new ShiftType();
    userUuids : string[] = [];
    weekDayResponse : WeekDay[] = [];
    weekdayInfos: OrganizationWeekoffInformation[] = [];
}

