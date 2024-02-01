import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffAttendanceLocationComponent } from './staff-attendance-location.component';

describe('StaffAttendanceLocationComponent', () => {
  let component: StaffAttendanceLocationComponent;
  let fixture: ComponentFixture<StaffAttendanceLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffAttendanceLocationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffAttendanceLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
