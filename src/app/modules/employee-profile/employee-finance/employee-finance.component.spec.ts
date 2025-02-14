import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeFinanceComponent } from './employee-finance.component';

describe('EmployeeFinanceComponent', () => {
  let component: EmployeeFinanceComponent;
  let fixture: ComponentFixture<EmployeeFinanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeFinanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeFinanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
