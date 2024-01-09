import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeOnboardingDataComponent } from './employee-onboarding-data.component';

describe('EmployeeOnboardingDataComponent', () => {
  let component: EmployeeOnboardingDataComponent;
  let fixture: ComponentFixture<EmployeeOnboardingDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeOnboardingDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeOnboardingDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
