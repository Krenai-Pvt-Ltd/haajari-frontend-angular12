import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveSettingCreateComponent } from './leave-setting-create.component';

describe('LeaveSettingCreateComponent', () => {
  let component: LeaveSettingCreateComponent;
  let fixture: ComponentFixture<LeaveSettingCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveSettingCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveSettingCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
