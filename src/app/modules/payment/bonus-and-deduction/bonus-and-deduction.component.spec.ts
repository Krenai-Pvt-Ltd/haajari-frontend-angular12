import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonusAndDeductionComponent } from './bonus-and-deduction.component';

describe('BonusAndDeductionComponent', () => {
  let component: BonusAndDeductionComponent;
  let fixture: ComponentFixture<BonusAndDeductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BonusAndDeductionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BonusAndDeductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
