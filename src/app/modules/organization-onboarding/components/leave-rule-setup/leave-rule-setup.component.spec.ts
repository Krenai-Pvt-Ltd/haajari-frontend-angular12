import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveRuleSetupComponent } from './leave-rule-setup.component';

describe('LeaveRuleSetupComponent', () => {
  let component: LeaveRuleSetupComponent;
  let fixture: ComponentFixture<LeaveRuleSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveRuleSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveRuleSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
