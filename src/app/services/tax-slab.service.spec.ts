import { TestBed } from '@angular/core/testing';

import { TaxSlabService } from './tax-slab.service';

describe('TaxSlabService', () => {
  let service: TaxSlabService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaxSlabService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
