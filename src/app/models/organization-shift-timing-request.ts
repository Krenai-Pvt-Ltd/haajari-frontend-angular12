import { OrganizationWeekoffInformation } from "./organization-weekoff-information";

export class OrganizationShiftTimingRequest {
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
    shiftTypeId ?: number = 0;
    userUuids : string[] = [];
    weekdayInfos: OrganizationWeekoffInformation[] = [];
   

}
