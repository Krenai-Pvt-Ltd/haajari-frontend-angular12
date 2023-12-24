import { ShiftType } from "./shift-type";

export class OrganizationShiftTimingResponse {
    id : number = 0;
    name : string = '';
    inTime : string = '';
    outTime : string = '';
    startLunch : string = '';
    endLunch : string = '';
    workingHour : string = '';
    lunchHour : string = '';
    shiftType : ShiftType = new ShiftType();
    userUuids : string[] = [];
}

