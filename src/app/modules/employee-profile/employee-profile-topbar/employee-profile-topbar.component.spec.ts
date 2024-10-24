import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeProfileTopbarComponent } from './employee-profile-topbar.component';

describe('EmployeeProfileTopbarComponent', () => {
  let component: EmployeeProfileTopbarComponent;
  let fixture: ComponentFixture<EmployeeProfileTopbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeProfileTopbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeProfileTopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
