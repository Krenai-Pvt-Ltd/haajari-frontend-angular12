import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAttendancePhotoComponent } from './employee-attendance-photo.component';

describe('EmployeeAttendancePhotoComponent', () => {
  let component: EmployeeAttendancePhotoComponent;
  let fixture: ComponentFixture<EmployeeAttendancePhotoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeAttendancePhotoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeAttendancePhotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
