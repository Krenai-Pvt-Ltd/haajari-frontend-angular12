import { OrganizationUserLocation } from "./OrganizationUserLocation";

export class StaffAddressDetailsForMultiLocation{
    organizationMultiLocationRequest:OrganizationUserLocation = new OrganizationUserLocation();
    userUuidsList:string[]=[];
    isForceUpdate:number=0;
}