import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillAndSubscriptionComponent } from './bill-and-subscription.component';

describe('BillAndSubscriptionComponent', () => {
  let component: BillAndSubscriptionComponent;
  let fixture: ComponentFixture<BillAndSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillAndSubscriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillAndSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
