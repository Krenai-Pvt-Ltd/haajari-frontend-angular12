import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetAttendanceModeComponent } from './set-attendance-mode.component';

describe('SetAttendanceModeComponent', () => {
  let component: SetAttendanceModeComponent;
  let fixture: ComponentFixture<SetAttendanceModeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SetAttendanceModeComponent]
    });
    fixture = TestBed.createComponent(SetAttendanceModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
