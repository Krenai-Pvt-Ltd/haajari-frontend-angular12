import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeProfileSidebarComponent } from './employee-profile-sidebar.component';

describe('EmployeeProfileSidebarComponent', () => {
  let component: EmployeeProfileSidebarComponent;
  let fixture: ComponentFixture<EmployeeProfileSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeProfileSidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeProfileSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
