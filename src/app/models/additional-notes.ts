import { asCleanDays } from "@fullcalendar/core/internal";
import { User } from "./user";

export class AdditionalNotes {
    id!: number;
    title!: string;
    message!: string;
    createdDate!: string;
    createdTime !: string;
    performedBy !: string;
    // user!: User;
}