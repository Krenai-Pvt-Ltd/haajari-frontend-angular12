import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatutoryDeductionComponent } from './statutory-deduction.component';

describe('StatutoryDeductionComponent', () => {
  let component: StatutoryDeductionComponent;
  let fixture: ComponentFixture<StatutoryDeductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatutoryDeductionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatutoryDeductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
