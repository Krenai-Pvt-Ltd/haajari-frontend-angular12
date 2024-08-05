import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingAndSubscriptionPageComponent } from './billing-and-subscription-page.component';

describe('BillingAndSubscriptionPageComponent', () => {
  let component: BillingAndSubscriptionPageComponent;
  let fixture: ComponentFixture<BillingAndSubscriptionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillingAndSubscriptionPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingAndSubscriptionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
