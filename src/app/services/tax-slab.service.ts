import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProfessionalTax } from '../payroll-models/ProfeessionalTax';

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
}
