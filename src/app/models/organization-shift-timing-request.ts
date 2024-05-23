import { OrganizationWeekoffInformation } from "./organization-weekoff-information";

export class OrganizationShiftTimingRequest {
    name : string = '';
    inTime : string = '';
    outTime : string = '';
    startLunch : string = '';
    endLunch : string = '';
    workingHour : string = '';
    lunchHour : string = '';
    shiftTypeId ?: number = 0;
    userUuids : string[] = [];
    weekdayInfos: OrganizationWeekoffInformation[] = [];
   

}
