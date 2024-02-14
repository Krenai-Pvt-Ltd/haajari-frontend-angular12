import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidayRuleSetupComponent } from './holiday-rule-setup.component';

describe('HolidayRuleSetupComponent', () => {
  let component: HolidayRuleSetupComponent;
  let fixture: ComponentFixture<HolidayRuleSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HolidayRuleSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HolidayRuleSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
