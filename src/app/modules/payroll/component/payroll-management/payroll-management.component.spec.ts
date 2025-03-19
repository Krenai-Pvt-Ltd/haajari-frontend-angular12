import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollManagementComponent } from './payroll-management.component';

describe('PayrollManagementComponent', () => {
  let component: PayrollManagementComponent;
  let fixture: ComponentFixture<PayrollManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayrollManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
