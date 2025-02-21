import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewEmployeeProfileSidebarComponent } from './new-employee-profile-sidebar.component';

describe('NewEmployeeProfileSidebarComponent', () => {
  let component: NewEmployeeProfileSidebarComponent;
  let fixture: ComponentFixture<NewEmployeeProfileSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewEmployeeProfileSidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewEmployeeProfileSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
