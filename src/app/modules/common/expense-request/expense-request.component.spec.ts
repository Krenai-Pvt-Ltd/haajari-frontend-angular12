import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseRequestComponent } from './expense-request.component';

describe('ExpenseRequestComponent', () => {
  let component: ExpenseRequestComponent;
  let fixture: ComponentFixture<ExpenseRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpenseRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
