import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionRestrictedComponent } from './subscription-restricted.component';

describe('SubscriptionRestrictedComponent', () => {
  let component: SubscriptionRestrictedComponent;
  let fixture: ComponentFixture<SubscriptionRestrictedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubscriptionRestrictedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionRestrictedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
