import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriorPayrollComponent } from './prior-payroll.component';

describe('PriorPayrollComponent', () => {
  let component: PriorPayrollComponent;
  let fixture: ComponentFixture<PriorPayrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriorPayrollComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriorPayrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
