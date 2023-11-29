import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeOnboardingSidebarComponent } from './employee-onboarding-sidebar.component';

describe('EmployeeOnboardingSidebarComponent', () => {
  let component: EmployeeOnboardingSidebarComponent;
  let fixture: ComponentFixture<EmployeeOnboardingSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeOnboardingSidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeOnboardingSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
