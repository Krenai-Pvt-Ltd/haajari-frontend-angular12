import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceRequestFormComponent } from './attendance-request-form.component';

describe('AttendanceRequestFormComponent', () => {
  let component: AttendanceRequestFormComponent;
  let fixture: ComponentFixture<AttendanceRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttendanceRequestFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendanceRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
