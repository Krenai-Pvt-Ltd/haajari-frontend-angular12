import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionEndedComponent } from './subscription-ended.component';

describe('SubscriptionEndedComponent', () => {
  let component: SubscriptionEndedComponent;
  let fixture: ComponentFixture<SubscriptionEndedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubscriptionEndedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionEndedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
