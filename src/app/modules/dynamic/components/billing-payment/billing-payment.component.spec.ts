import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingPaymentComponent } from './billing-payment.component';

describe('BillingPaymentComponent', () => {
  let component: BillingPaymentComponent;
  let fixture: ComponentFixture<BillingPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillingPaymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
