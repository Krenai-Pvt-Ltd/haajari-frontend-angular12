import { PFContributionRate } from "./p-f-contribution-rate";

export class StatutoryAttributeRequest {
    id : number = 0;
    name : string = '';
    description : string = '';
    selectedRate : PFContributionRate = new PFContributionRate();
}
