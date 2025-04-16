import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceAndLopManagementComponent } from './attendance-and-lop-management.component';

describe('AttendanceAndLopManagementComponent', () => {
  let component: AttendanceAndLopManagementComponent;
  let fixture: ComponentFixture<AttendanceAndLopManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttendanceAndLopManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendanceAndLopManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
