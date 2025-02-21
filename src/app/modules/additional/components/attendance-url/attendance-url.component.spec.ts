import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceUrlComponent } from './attendance-url.component';

describe('AttendanceUrlComponent', () => {
  let component: AttendanceUrlComponent;
  let fixture: ComponentFixture<AttendanceUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttendanceUrlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendanceUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
