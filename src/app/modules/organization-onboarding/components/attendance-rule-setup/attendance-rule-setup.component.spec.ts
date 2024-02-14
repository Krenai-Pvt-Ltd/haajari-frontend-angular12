import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceRuleSetupComponent } from './attendance-rule-setup.component';

describe('AttendanceRuleSetupComponent', () => {
  let component: AttendanceRuleSetupComponent;
  let fixture: ComponentFixture<AttendanceRuleSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttendanceRuleSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendanceRuleSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
