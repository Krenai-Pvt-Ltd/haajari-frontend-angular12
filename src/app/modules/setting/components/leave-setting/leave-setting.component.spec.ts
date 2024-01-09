import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveSettingComponent } from './leave-setting.component';

describe('LeaveSettingComponent', () => {
  let component: LeaveSettingComponent;
  let fixture: ComponentFixture<LeaveSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
