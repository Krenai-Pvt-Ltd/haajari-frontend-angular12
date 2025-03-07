import { TestBed } from '@angular/core/testing';

import { PayrollConfigurationService } from './payroll-configuration.service';

describe('PayrollConfigurationService', () => {
  let service: PayrollConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayrollConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
