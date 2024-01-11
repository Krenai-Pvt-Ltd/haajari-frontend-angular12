import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeOnboardingFormComponent } from './employee-onboarding-form.component';

describe('EmployeeOnboardingFormComponent', () => {
  let component: EmployeeOnboardingFormComponent;
  let fixture: ComponentFixture<EmployeeOnboardingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeOnboardingFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeOnboardingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
