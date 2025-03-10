import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenefitDetailsComponent } from './benefit-details.component';

describe('BenefitDetailsComponent', () => {
  let component: BenefitDetailsComponent;
  let fixture: ComponentFixture<BenefitDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BenefitDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BenefitDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
