import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProfessionalTax } from '../payroll-models/ProfeessionalTax';
import { EarningComponent } from '../payroll-models/EarrningComponent';
import { PayrollTodoStep } from '../payroll-models/PayrollTodoStep';

@Injectable({
  providedIn: 'root'
})
export class TaxSlabService {

  constructor() { }


  private taxSlabSubject = new BehaviorSubject<ProfessionalTax | null>(null);
  taxSlab$ = this.taxSlabSubject.asObservable();

  updateTaxSlab(taxSlab: ProfessionalTax) {
    this.taxSlabSubject.next(taxSlab); 
  }

  private earning = new BehaviorSubject<EarningComponent | null>(null);
  earning$ = this.earning.asObservable();

  editEarning(earning: EarningComponent) {
    this.earning.next(earning); 
  }
}
