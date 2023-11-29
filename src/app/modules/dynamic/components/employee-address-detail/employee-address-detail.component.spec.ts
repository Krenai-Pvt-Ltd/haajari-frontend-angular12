import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAddressDetailComponent } from './employee-address-detail.component';

describe('EmployeeAddressDetailComponent', () => {
  let component: EmployeeAddressDetailComponent;
  let fixture: ComponentFixture<EmployeeAddressDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeAddressDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeAddressDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
