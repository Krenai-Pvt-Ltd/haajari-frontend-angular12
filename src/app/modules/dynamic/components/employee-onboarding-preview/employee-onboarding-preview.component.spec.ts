import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeOnboardingPreviewComponent } from './employee-onboarding-preview.component';

describe('EmployeeOnboardingPreviewComponent', () => {
  let component: EmployeeOnboardingPreviewComponent;
  let fixture: ComponentFixture<EmployeeOnboardingPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeOnboardingPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeOnboardingPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
