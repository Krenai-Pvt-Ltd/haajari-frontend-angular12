import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLocationValidatorComponent } from './employee-location-validator.component';

describe('EmployeeLocationValidatorComponent', () => {
  let component: EmployeeLocationValidatorComponent;
  let fixture: ComponentFixture<EmployeeLocationValidatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeLocationValidatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeLocationValidatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
