import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseManagementComponent } from './expense-management.component';

describe('ExpenseManagementComponent', () => {
  let component: ExpenseManagementComponent;
  let fixture: ComponentFixture<ExpenseManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpenseManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
