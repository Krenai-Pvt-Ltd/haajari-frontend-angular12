import { CompatibleDate } from "ng-zorro-antd/date-picker";

export class OvertimeRequestDTO {
    startTime !: Date | CompatibleDate | null;
    endTime !: Date | CompatibleDate | null;
    workingHour : string | null = '';
    managerUuid : string | null = '';
}
