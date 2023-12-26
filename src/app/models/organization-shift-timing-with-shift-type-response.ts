import { OrganizationShiftTimingResponse } from "./organization-shift-timing-response";
import { ShiftType } from "./shift-type";

export class OrganizationShiftTimingWithShiftTypeResponse {
    shiftType : ShiftType = new ShiftType();
    organizationShiftTimingResponseList : OrganizationShiftTimingResponse[] = [];
}
