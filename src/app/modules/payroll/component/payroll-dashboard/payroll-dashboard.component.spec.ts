import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollDashboardComponent } from './payroll-dashboard.component';

describe('PayrollDashboardComponent', () => {
  let component: PayrollDashboardComponent;
  let fixture: ComponentFixture<PayrollDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayrollDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
