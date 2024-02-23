import { PFContributionRate } from "./p-f-contribution-rate";

export class StatutoryAttribute {

    id : number = 0;
    name : string = '';
    description : string = '';
    selectedRate : PFContributionRate = {
        id: 1,
        name: '12% of PF Wage (Unrestricted)',
        description: ''
      };
}
