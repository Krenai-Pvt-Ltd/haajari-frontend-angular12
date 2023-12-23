export class OrganizationShiftTimingRequest {
    name : string = '';
    inTime : string = '';
    outTime : string = '';
    startLunch : string = '';
    endLunch : string = '';
    workingHour : string = '';
    lunchHour : string = '';
    shiftTypeId : number = 0;

    errors: { [key: string]: string } = {};

}
