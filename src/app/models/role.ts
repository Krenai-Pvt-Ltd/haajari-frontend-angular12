import { RoleAccessibilityType } from "../role-accessibility-type";

export class Role {
    id !: number;
    name !: string;
    description !: string;
    createdDate !: string;
    updatedDate !: string;
    roleAccessibilityType : RoleAccessibilityType = new RoleAccessibilityType();
    count : number = 0;
}
