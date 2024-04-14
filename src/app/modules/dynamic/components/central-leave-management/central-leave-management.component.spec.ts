import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentralLeaveManagementComponent } from './central-leave-management.component';

describe('CentralLeaveManagementComponent', () => {
  let component: CentralLeaveManagementComponent;
  let fixture: ComponentFixture<CentralLeaveManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CentralLeaveManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CentralLeaveManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
