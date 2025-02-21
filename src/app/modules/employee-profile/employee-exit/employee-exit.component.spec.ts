import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeExitComponent } from './employee-exit.component';

describe('EmployeeExitComponent', () => {
  let component: EmployeeExitComponent;
  let fixture: ComponentFixture<EmployeeExitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeExitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeExitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
