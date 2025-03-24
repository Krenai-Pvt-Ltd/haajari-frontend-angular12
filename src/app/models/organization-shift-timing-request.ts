import { OrganizationWeekoffInformation } from "./organization-weekoff-information";

export class OrganizationShiftTimingRequest {
    name : string = '';
    inTime !: Date ;
    outTime !: Date ;
    startLunch !: Date ;
    endLunch !: Date ;
    autoCheckedOut : boolean = false ;
    autoCheckout !: Date ;
    inTimeDate?: Date;
    outTimeDate?: Date;
    startLunchDate?: Date;
    endLunchDate?: Date;
    workingHour ?: string ;
    lunchHour : string = '';
    shiftTypeId ?: number = 0;
    userUuids : string[] = [];
    weekdayInfos: OrganizationWeekoffInformation[] = [];


}
