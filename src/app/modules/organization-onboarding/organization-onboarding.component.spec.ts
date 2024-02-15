import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationOnboardingComponent } from './organization-onboarding.component';

describe('OrganizationOnboardingComponent', () => {
  let component: OrganizationOnboardingComponent;
  let fixture: ComponentFixture<OrganizationOnboardingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationOnboardingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationOnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
