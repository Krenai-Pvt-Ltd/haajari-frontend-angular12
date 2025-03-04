import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProfessionalTax } from '../payroll-models/ProfeessionalTax';

@Injectable({
  providedIn: 'root'
})
export class TaxSlabService {

  constructor() { }


  private taxSlabSubject = new BehaviorSubject<ProfessionalTax | null>(null);
  taxSlab$ = this.taxSlabSubject.asObservable(); // Observable for subscribing in other components

  updateTaxSlab(taxSlab: ProfessionalTax) {
    console.log('✅ Tax Slab Updated in Service:', taxSlab);
    this.taxSlabSubject.next(taxSlab); // Update the data
  }
}
