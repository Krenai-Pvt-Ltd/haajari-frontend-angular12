import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewEmployeeProfileComponent } from './new-employee-profile.component';

describe('NewEmployeeProfileComponent', () => {
  let component: NewEmployeeProfileComponent;
  let fixture: ComponentFixture<NewEmployeeProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewEmployeeProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewEmployeeProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
