import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceModeComponent } from './attendance-mode.component';

describe('AttendanceModeComponent', () => {
  let component: AttendanceModeComponent;
  let fixture: ComponentFixture<AttendanceModeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttendanceModeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendanceModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
