import { TestBed } from '@angular/core/testing';


import { SalaryTemplateService } from './salary-template.service';

describe('SalaryTemplateService', () => {
  let service: SalaryTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalaryTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
