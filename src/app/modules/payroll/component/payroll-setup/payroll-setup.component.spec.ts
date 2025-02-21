import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollSetupComponent } from './payroll-setup.component';

describe('PayrollSetupComponent', () => {
  let component: PayrollSetupComponent;
  let fixture: ComponentFixture<PayrollSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayrollSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
