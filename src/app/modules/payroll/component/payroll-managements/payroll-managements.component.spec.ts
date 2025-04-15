import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollManagementsComponent } from './payroll-managements.component';

describe('PayrollManagementsComponent', () => {
  let component: PayrollManagementsComponent;
  let fixture: ComponentFixture<PayrollManagementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayrollManagementsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollManagementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
