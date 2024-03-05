import { TestBed } from '@angular/core/testing';

import { OrganizationOnboardingService } from './organization-onboarding.service';

describe('OrganizationOnboardingService', () => {
  let service: OrganizationOnboardingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizationOnboardingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
