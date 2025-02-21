import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToDoStepDashboardComponent } from './to-do-step-dashboard.component';

describe('ToDoStepDashboardComponent', () => {
  let component: ToDoStepDashboardComponent;
  let fixture: ComponentFixture<ToDoStepDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToDoStepDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToDoStepDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
