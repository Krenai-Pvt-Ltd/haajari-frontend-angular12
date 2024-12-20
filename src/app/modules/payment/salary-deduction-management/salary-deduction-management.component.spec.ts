import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryDeductionManagementComponent } from './salary-deduction-management.component';

describe('SalaryDeductionManagementComponent', () => {
  let component: SalaryDeductionManagementComponent;
  let fixture: ComponentFixture<SalaryDeductionManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalaryDeductionManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SalaryDeductionManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
