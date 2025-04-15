import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeChangesComponent } from './employee-changes.component';

describe('EmployeeChangesComponent', () => {
  let component: EmployeeChangesComponent;
  let fixture: ComponentFixture<EmployeeChangesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeChangesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeChangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
